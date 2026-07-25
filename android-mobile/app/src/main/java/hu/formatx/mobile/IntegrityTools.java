package hu.formatx.mobile;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Locale;

public final class IntegrityTools {
    private IntegrityTools() {}

    public interface ProgressListener {
        void onProgress(long processedBytes, long totalBytes);
    }

    public static final class ImageInfo {
        public final String displayName;
        public final long sizeBytes;
        public final boolean hasMbrSignature;
        public final boolean hasGptHeader;
        public final boolean hasIso9660Descriptor;
        public final boolean hasElToritoBootRecord;

        ImageInfo(
                String displayName,
                long sizeBytes,
                boolean hasMbrSignature,
                boolean hasGptHeader,
                boolean hasIso9660Descriptor,
                boolean hasElToritoBootRecord
        ) {
            this.displayName = displayName;
            this.sizeBytes = sizeBytes;
            this.hasMbrSignature = hasMbrSignature;
            this.hasGptHeader = hasGptHeader;
            this.hasIso9660Descriptor = hasIso9660Descriptor;
            this.hasElToritoBootRecord = hasElToritoBootRecord;
        }

        public String summary(boolean hungarian) {
            StringBuilder text = new StringBuilder();
            text.append(displayName).append('\n');
            text.append(UsbOperations.humanBytes(sizeBytes)).append('\n');
            text.append(hungarian ? "MBR aláírás: " : "MBR signature: ")
                    .append(hasMbrSignature ? "igen" : "nem").append('\n');
            text.append(hungarian ? "GPT fejléc: " : "GPT header: ")
                    .append(hasGptHeader ? "igen" : "nem").append('\n');
            text.append("ISO9660: ").append(hasIso9660Descriptor ? "igen" : "nem").append('\n');
            text.append("El Torito: ").append(hasElToritoBootRecord ? "igen" : "nem");
            return text.toString();
        }
    }

    public static ImageInfo inspectImage(Context context, Uri uri) throws IOException {
        ContentResolver resolver = context.getContentResolver();
        byte[] header = new byte[80 * 1024];
        int read;
        try (InputStream input = requireInput(resolver, uri)) {
            read = readUpTo(input, header);
        }

        boolean mbr = read >= 512 && (header[510] & 0xff) == 0x55 && (header[511] & 0xff) == 0xaa;
        boolean gpt = read >= 520 && asciiEquals(header, 512, "EFI PART");
        boolean iso = read > 32774 && asciiEquals(header, 32769, "CD001");
        boolean elTorito = false;
        for (int sector = 16; sector < 32; sector++) {
            int offset = sector * 2048;
            if (offset + 72 > read) break;
            if ((header[offset] & 0xff) == 0
                    && asciiEquals(header, offset + 1, "CD001")
                    && asciiContains(header, offset + 7, 64, "EL TORITO SPECIFICATION")) {
                elTorito = true;
                break;
            }
        }

        return new ImageInfo(
                displayName(resolver, uri),
                UsbOperations.queryLength(resolver, uri),
                mbr,
                gpt,
                iso,
                elTorito
        );
    }

    public static String sha256(
            Context context,
            Uri uri,
            ProgressListener listener
    ) throws IOException {
        ContentResolver resolver = context.getContentResolver();
        long total = UsbOperations.queryLength(resolver, uri);
        MessageDigest digest;
        try {
            digest = MessageDigest.getInstance("SHA-256");
        } catch (Exception error) {
            throw new IOException("SHA-256 is unavailable", error);
        }

        byte[] buffer = new byte[1024 * 1024];
        long processed = 0L;
        try (InputStream input = requireInput(resolver, uri)) {
            int read;
            while ((read = input.read(buffer)) >= 0) {
                if (read == 0) continue;
                digest.update(buffer, 0, read);
                processed += read;
                if (listener != null) listener.onProgress(processed, total);
            }
        }
        return hex(digest.digest());
    }

    public static boolean verifyEd25519(
            Context context,
            Uri dataUri,
            Uri publicKeyUri,
            Uri signatureUri
    ) throws IOException {
        try {
            byte[] publicKeyBytes = readAll(context.getContentResolver(), publicKeyUri, 64 * 1024);
            byte[] signatureBytes = normalizeSignature(
                    readAll(context.getContentResolver(), signatureUri, 64 * 1024)
            );

            String publicKeyText = new String(publicKeyBytes, StandardCharsets.US_ASCII).trim();
            if (publicKeyText.contains("BEGIN PUBLIC KEY")) {
                publicKeyText = publicKeyText
                        .replace("-----BEGIN PUBLIC KEY-----", "")
                        .replace("-----END PUBLIC KEY-----", "")
                        .replaceAll("\\s+", "");
                publicKeyBytes = Base64.getDecoder().decode(publicKeyText);
            }

            PublicKey publicKey = KeyFactory.getInstance("Ed25519")
                    .generatePublic(new X509EncodedKeySpec(publicKeyBytes));
            Signature verifier = Signature.getInstance("Ed25519");
            verifier.initVerify(publicKey);

            byte[] buffer = new byte[1024 * 1024];
            try (InputStream input = requireInput(context.getContentResolver(), dataUri)) {
                int read;
                while ((read = input.read(buffer)) >= 0) {
                    if (read > 0) verifier.update(buffer, 0, read);
                }
            }
            return verifier.verify(signatureBytes);
        } catch (IOException error) {
            throw error;
        } catch (Exception error) {
            throw new IOException("Ed25519 verification failed: " + error.getMessage(), error);
        }
    }

    public static String displayName(ContentResolver resolver, Uri uri) {
        try (Cursor cursor = resolver.query(
                uri,
                new String[]{OpenableColumns.DISPLAY_NAME},
                null,
                null,
                null
        )) {
            if (cursor != null && cursor.moveToFirst() && !cursor.isNull(0)) {
                return cursor.getString(0);
            }
        } catch (Exception ignored) {
            // Use the URI segment below.
        }
        String segment = uri.getLastPathSegment();
        return segment == null ? "selected-file" : segment;
    }

    private static byte[] normalizeSignature(byte[] source) {
        if (source.length == 64) return source;
        String text = new String(source, StandardCharsets.US_ASCII).trim();
        if (text.matches("(?i)[0-9a-f]{128}")) {
            byte[] result = new byte[64];
            for (int index = 0; index < result.length; index++) {
                result[index] = (byte) Integer.parseInt(text.substring(index * 2, index * 2 + 2), 16);
            }
            return result;
        }
        return Base64.getDecoder().decode(text.replaceAll("\\s+", ""));
    }

    private static boolean asciiEquals(byte[] data, int offset, String expected) {
        byte[] bytes = expected.getBytes(StandardCharsets.US_ASCII);
        if (offset < 0 || offset + bytes.length > data.length) return false;
        for (int index = 0; index < bytes.length; index++) {
            if (data[offset + index] != bytes[index]) return false;
        }
        return true;
    }

    private static boolean asciiContains(byte[] data, int offset, int length, String expected) {
        int safeLength = Math.min(length, data.length - offset);
        if (safeLength <= 0) return false;
        String text = new String(data, offset, safeLength, StandardCharsets.US_ASCII);
        return text.contains(expected);
    }

    private static InputStream requireInput(ContentResolver resolver, Uri uri) throws IOException {
        InputStream input = resolver.openInputStream(uri);
        if (input == null) throw new IOException("Could not open selected file");
        return input;
    }

    private static int readUpTo(InputStream input, byte[] target) throws IOException {
        int total = 0;
        while (total < target.length) {
            int read = input.read(target, total, target.length - total);
            if (read < 0) break;
            if (read > 0) total += read;
        }
        return total;
    }

    private static byte[] readAll(ContentResolver resolver, Uri uri, int maximumBytes) throws IOException {
        try (InputStream input = requireInput(resolver, uri);
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int total = 0;
            int read;
            while ((read = input.read(buffer)) >= 0) {
                if (read == 0) continue;
                total += read;
                if (total > maximumBytes) throw new IOException("Selected metadata file is too large");
                output.write(buffer, 0, read);
            }
            return output.toByteArray();
        }
    }

    private static String hex(byte[] bytes) {
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            result.append(String.format(Locale.ROOT, "%02x", value & 0xff));
        }
        return result.toString();
    }
}
