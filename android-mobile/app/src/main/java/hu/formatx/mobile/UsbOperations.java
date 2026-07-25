package hu.formatx.mobile;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.provider.OpenableColumns;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

public final class UsbOperations {
    private static final int TARGET_CHUNK_BYTES = 1024 * 1024;
    private static final long QUICK_ERASE_EDGE_BYTES = 16L * 1024L * 1024L;

    private UsbOperations() {}

    public interface ProgressListener {
        void onProgress(int percent, String message);
    }

    public enum EraseMode {
        QUICK_METADATA,
        FULL_ZERO,
        FULL_RANDOM
    }

    public static final class ImageWriteResult {
        public final long sourceBytes;
        public final String sourceSha256;
        public final boolean verified;

        ImageWriteResult(long sourceBytes, String sourceSha256, boolean verified) {
            this.sourceBytes = sourceBytes;
            this.sourceSha256 = sourceSha256;
            this.verified = verified;
        }
    }

    public static final class ScanResult {
        public final long scannedBytes;
        public final long elapsedMillis;
        public final double mibPerSecond;

        ScanResult(long scannedBytes, long elapsedMillis) {
            this.scannedBytes = scannedBytes;
            this.elapsedMillis = elapsedMillis;
            this.mibPerSecond = elapsedMillis <= 0
                    ? 0.0
                    : (scannedBytes / 1048576.0) / (elapsedMillis / 1000.0);
        }
    }

    public static ImageWriteResult writeImage(
            Context context,
            Uri sourceUri,
            RawUsbMassStorageDevice device,
            boolean verify,
            AtomicBoolean cancelled,
            ProgressListener listener
    ) throws IOException {
        ContentResolver resolver = context.getContentResolver();
        long sourceBytes = queryLength(resolver, sourceUri);
        if (sourceBytes <= 0) {
            throw new IOException("The selected image size is unknown or empty");
        }
        if (sourceBytes > device.getCapacityBytes()) {
            throw new IOException("The image is larger than the USB device");
        }

        int blockSize = device.getBlockSize();
        int chunkBytes = alignedChunkSize(blockSize);
        byte[] buffer = new byte[chunkBytes];
        MessageDigest digest = sha256Digest();
        long writtenSourceBytes = 0L;
        long blockOffset = 0L;

        notifyProgress(listener, 0, "USB image write started");
        try (InputStream input = requireInput(resolver, sourceUri)) {
            while (writtenSourceBytes < sourceBytes) {
                checkCancelled(cancelled);
                int wanted = (int) Math.min(buffer.length, sourceBytes - writtenSourceBytes);
                int read = readFullyOrToEnd(input, buffer, wanted);
                if (read <= 0) {
                    throw new IOException("The image ended before its reported size");
                }

                digest.update(buffer, 0, read);
                int aligned = roundUp(read, blockSize);
                if (aligned > read) {
                    Arrays.fill(buffer, read, aligned, (byte) 0);
                }

                device.writeBlocks(blockOffset, ByteBuffer.wrap(buffer, 0, aligned));
                writtenSourceBytes += read;
                blockOffset += aligned / blockSize;
                notifyProgress(
                        listener,
                        progress(writtenSourceBytes, sourceBytes, verify ? 0, 70),
                        "Writing image · " + humanBytes(writtenSourceBytes) + " / " + humanBytes(sourceBytes)
                );
            }
        }

        String hash = hex(digest.digest());
        if (verify) {
            verifyImage(context, sourceUri, sourceBytes, device, cancelled, listener);
        }
        notifyProgress(listener, 100, verify ? "Write and verification completed" : "Write completed");
        return new ImageWriteResult(sourceBytes, hash, verify);
    }

    private static void verifyImage(
            Context context,
            Uri sourceUri,
            long sourceBytes,
            RawUsbMassStorageDevice device,
            AtomicBoolean cancelled,
            ProgressListener listener
    ) throws IOException {
        ContentResolver resolver = context.getContentResolver();
        int blockSize = device.getBlockSize();
        int chunkBytes = alignedChunkSize(blockSize);
        byte[] source = new byte[chunkBytes];
        byte[] target = new byte[chunkBytes];
        long checked = 0L;
        long blockOffset = 0L;

        try (InputStream input = requireInput(resolver, sourceUri)) {
            while (checked < sourceBytes) {
                checkCancelled(cancelled);
                int wanted = (int) Math.min(source.length, sourceBytes - checked);
                int read = readFullyOrToEnd(input, source, wanted);
                if (read <= 0) {
                    throw new IOException("The image ended during verification");
                }
                int aligned = roundUp(read, blockSize);
                ByteBuffer targetBuffer = ByteBuffer.wrap(target, 0, aligned);
                device.readBlocks(blockOffset, targetBuffer);
                for (int index = 0; index < read; index++) {
                    if (source[index] != target[index]) {
                        throw new IOException("Verification mismatch at byte " + (checked + index));
                    }
                }
                checked += read;
                blockOffset += aligned / blockSize;
                notifyProgress(
                        listener,
                        progress(checked, sourceBytes, 70, 100),
                        "Verifying image · " + humanBytes(checked) + " / " + humanBytes(sourceBytes)
                );
            }
        }
    }

    public static ScanResult surfaceScan(
            RawUsbMassStorageDevice device,
            long requestedBytes,
            AtomicBoolean cancelled,
            ProgressListener listener
    ) throws IOException {
        long capacity = device.getCapacityBytes();
        long scanBytes = requestedBytes <= 0 ? capacity : Math.min(requestedBytes, capacity);
        int blockSize = device.getBlockSize();
        int chunkBytes = alignedChunkSize(blockSize);
        byte[] buffer = new byte[chunkBytes];
        long scanned = 0L;
        long blockOffset = 0L;
        long started = System.currentTimeMillis();

        while (scanned < scanBytes) {
            checkCancelled(cancelled);
            int wanted = (int) Math.min(buffer.length, scanBytes - scanned);
            int aligned = roundDown(wanted, blockSize);
            if (aligned == 0) {
                aligned = blockSize;
            }
            device.readBlocks(blockOffset, ByteBuffer.wrap(buffer, 0, aligned));
            scanned = Math.min(scanBytes, scanned + aligned);
            blockOffset += aligned / blockSize;
            notifyProgress(
                    listener,
                    progress(scanned, scanBytes, 0, 100),
                    "Surface scan · " + humanBytes(scanned) + " / " + humanBytes(scanBytes)
            );
        }

        return new ScanResult(scanned, Math.max(1L, System.currentTimeMillis() - started));
    }

    public static void erase(
            RawUsbMassStorageDevice device,
            EraseMode mode,
            AtomicBoolean cancelled,
            ProgressListener listener
    ) throws IOException {
        if (mode == EraseMode.QUICK_METADATA) {
            eraseRange(device, 0L, Math.min(QUICK_ERASE_EDGE_BYTES, device.getCapacityBytes()), false,
                    cancelled, listener, 0, 50, "Clearing first metadata area");
            long edge = Math.min(QUICK_ERASE_EDGE_BYTES, device.getCapacityBytes());
            long start = Math.max(0L, device.getCapacityBytes() - edge);
            eraseRange(device, start, edge, false,
                    cancelled, listener, 50, 100, "Clearing last metadata area");
            notifyProgress(listener, 100, "Quick metadata erase completed");
            return;
        }

        boolean random = mode == EraseMode.FULL_RANDOM;
        eraseRange(device, 0L, device.getCapacityBytes(), random,
                cancelled, listener, 0, 100, random ? "Random overwrite" : "Zero overwrite");
        notifyProgress(listener, 100, "Full overwrite completed");
    }

    private static void eraseRange(
            RawUsbMassStorageDevice device,
            long byteStart,
            long byteLength,
            boolean random,
            AtomicBoolean cancelled,
            ProgressListener listener,
            int progressStart,
            int progressEnd,
            String label
    ) throws IOException {
        int blockSize = device.getBlockSize();
        int chunkBytes = alignedChunkSize(blockSize);
        byte[] buffer = new byte[chunkBytes];
        SecureRandom secureRandom = random ? new SecureRandom() : null;
        long firstBlock = byteStart / blockSize;
        long totalBlocks = Math.min(
                device.getBlockCount() - firstBlock,
                (byteLength + blockSize - 1L) / blockSize
        );
        long completedBlocks = 0L;

        while (completedBlocks < totalBlocks) {
            checkCancelled(cancelled);
            int blocksNow = (int) Math.min(chunkBytes / blockSize, totalBlocks - completedBlocks);
            int bytesNow = blocksNow * blockSize;
            if (secureRandom != null) {
                secureRandom.nextBytes(buffer);
            } else {
                Arrays.fill(buffer, 0, bytesNow, (byte) 0);
            }
            device.writeBlocks(firstBlock + completedBlocks, ByteBuffer.wrap(buffer, 0, bytesNow));
            completedBlocks += blocksNow;
            notifyProgress(
                    listener,
                    progress(completedBlocks, totalBlocks, progressStart, progressEnd),
                    label + " · " + humanBytes(completedBlocks * blockSize)
            );
        }
    }

    public static long queryLength(ContentResolver resolver, Uri uri) {
        try (android.database.Cursor cursor = resolver.query(
                uri,
                new String[]{OpenableColumns.SIZE},
                null,
                null,
                null
        )) {
            if (cursor != null && cursor.moveToFirst() && !cursor.isNull(0)) {
                return cursor.getLong(0);
            }
        } catch (Exception ignored) {
            // Fall back to AssetFileDescriptor.
        }
        try (android.content.res.AssetFileDescriptor descriptor = resolver.openAssetFileDescriptor(uri, "r")) {
            return descriptor == null ? -1L : descriptor.getLength();
        } catch (Exception ignored) {
            return -1L;
        }
    }

    private static InputStream requireInput(ContentResolver resolver, Uri uri) throws IOException {
        InputStream input = resolver.openInputStream(uri);
        if (input == null) {
            throw new IOException("Could not open selected file");
        }
        return input;
    }

    private static int alignedChunkSize(int blockSize) {
        int blocks = Math.max(1, TARGET_CHUNK_BYTES / blockSize);
        return blocks * blockSize;
    }

    private static int roundUp(int value, int alignment) {
        return ((value + alignment - 1) / alignment) * alignment;
    }

    private static int roundDown(int value, int alignment) {
        return (value / alignment) * alignment;
    }

    private static int readFullyOrToEnd(InputStream input, byte[] buffer, int wanted) throws IOException {
        int total = 0;
        while (total < wanted) {
            int read = input.read(buffer, total, wanted - total);
            if (read < 0) {
                break;
            }
            if (read == 0) {
                continue;
            }
            total += read;
        }
        return total;
    }

    private static void checkCancelled(AtomicBoolean cancelled) throws IOException {
        if (cancelled != null && cancelled.get()) {
            throw new IOException("Operation cancelled");
        }
        if (Thread.currentThread().isInterrupted()) {
            throw new IOException("Operation interrupted");
        }
    }

    private static int progress(long current, long total, int from, int to) {
        if (total <= 0) {
            return from;
        }
        double ratio = Math.max(0.0, Math.min(1.0, (double) current / (double) total));
        return from + (int) Math.round((to - from) * ratio);
    }

    private static void notifyProgress(ProgressListener listener, int percent, String message) {
        if (listener != null) {
            listener.onProgress(Math.max(0, Math.min(100, percent)), message);
        }
    }

    private static MessageDigest sha256Digest() throws IOException {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException error) {
            throw new IOException("SHA-256 is unavailable", error);
        }
    }

    private static String hex(byte[] bytes) {
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            result.append(String.format(Locale.ROOT, "%02x", value & 0xff));
        }
        return result.toString();
    }

    public static String humanBytes(long bytes) {
        if (bytes < 1000L) return bytes + " B";
        double value = bytes;
        String[] units = {"kB", "MB", "GB", "TB"};
        int unit = -1;
        while (value >= 1000.0 && unit < units.length - 1) {
            value /= 1000.0;
            unit++;
        }
        return String.format(Locale.ROOT, "%.2f %s", value, units[unit]);
    }
}
