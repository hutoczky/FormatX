package hu.formatx.mobile;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;

import androidx.documentfile.provider.DocumentFile;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public final class StorageTools {
    private static final int BUFFER_BYTES = 256 * 1024;

    private StorageTools() {}

    public interface StatusListener {
        void onStatus(String message);
    }

    public static List<DocumentFile> sortedChildren(DocumentFile directory) {
        DocumentFile[] children = directory == null ? new DocumentFile[0] : directory.listFiles();
        Arrays.sort(children, Comparator
                .comparing((DocumentFile file) -> !file.isDirectory())
                .thenComparing(file -> safeName(file).toLowerCase(Locale.ROOT)));
        return new ArrayList<>(Arrays.asList(children));
    }

    public static DocumentFile copy(
            Context context,
            DocumentFile source,
            DocumentFile targetDirectory,
            boolean move,
            StatusListener listener
    ) throws IOException {
        requireDirectory(targetDirectory);
        if (source == null || !source.exists()) throw new IOException("Source no longer exists");
        if (sameDocument(source, targetDirectory)) throw new IOException("Source and destination are the same");

        DocumentFile created;
        if (source.isDirectory()) {
            created = targetDirectory.createDirectory(uniqueName(targetDirectory, safeName(source)));
            if (created == null) throw new IOException("Could not create destination folder");
            for (DocumentFile child : sortedChildren(source)) {
                copy(context, child, created, false, listener);
            }
        } else {
            String name = uniqueName(targetDirectory, safeName(source));
            String mime = source.getType() == null ? "application/octet-stream" : source.getType();
            created = targetDirectory.createFile(mime, name);
            if (created == null) throw new IOException("Could not create destination file");
            if (listener != null) listener.onStatus("Copying " + safeName(source));
            copyStreams(context.getContentResolver(), source.getUri(), created.getUri());
        }

        if (move && !deleteRecursive(source)) {
            throw new IOException("Copy completed, but the original could not be deleted");
        }
        return created;
    }

    public static boolean deleteRecursive(DocumentFile file) {
        if (file == null || !file.exists()) return true;
        if (file.isDirectory()) {
            for (DocumentFile child : file.listFiles()) {
                if (!deleteRecursive(child)) return false;
            }
        }
        return file.delete();
    }

    public static DocumentFile createFolder(DocumentFile directory, String requestedName) throws IOException {
        requireDirectory(directory);
        String clean = sanitizeName(requestedName);
        if (clean.isBlank()) throw new IOException("Folder name is empty");
        DocumentFile result = directory.createDirectory(uniqueName(directory, clean));
        if (result == null) throw new IOException("Could not create folder");
        return result;
    }

    public static void zip(
            Context context,
            DocumentFile source,
            Uri outputUri,
            StatusListener listener
    ) throws IOException {
        ContentResolver resolver = context.getContentResolver();
        try (OutputStream raw = resolver.openOutputStream(outputUri, "w");
             ZipOutputStream zip = raw == null ? null : new ZipOutputStream(new BufferedOutputStream(raw))) {
            if (zip == null) throw new IOException("Could not create ZIP output");
            String root = safeName(source);
            addToZip(resolver, source, root, zip, listener);
        }
    }

    public static void unzip(
            Context context,
            Uri zipUri,
            DocumentFile targetDirectory,
            StatusListener listener
    ) throws IOException {
        requireDirectory(targetDirectory);
        ContentResolver resolver = context.getContentResolver();
        try (InputStream raw = resolver.openInputStream(zipUri);
             ZipInputStream zip = raw == null ? null : new ZipInputStream(new BufferedInputStream(raw))) {
            if (zip == null) throw new IOException("Could not open ZIP file");
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                String safePath = normalizeZipPath(entry.getName());
                if (safePath.isBlank()) {
                    zip.closeEntry();
                    continue;
                }
                if (listener != null) listener.onStatus("Extracting " + safePath);
                DocumentFile destination = ensureZipDestination(targetDirectory, safePath, entry.isDirectory());
                if (!entry.isDirectory()) {
                    try (OutputStream output = resolver.openOutputStream(destination.getUri(), "w")) {
                        if (output == null) throw new IOException("Could not write " + safePath);
                        transfer(zip, output);
                    }
                }
                zip.closeEntry();
            }
        }
    }

    public static String describe(DocumentFile file) {
        if (file == null) return "";
        if (file.isDirectory()) return safeName(file) + " · folder";
        return safeName(file) + " · " + UsbOperations.humanBytes(Math.max(0L, file.length()));
    }

    private static void addToZip(
            ContentResolver resolver,
            DocumentFile source,
            String path,
            ZipOutputStream zip,
            StatusListener listener
    ) throws IOException {
        String safePath = path.replace('\\', '/');
        if (source.isDirectory()) {
            if (!safePath.endsWith("/")) safePath += "/";
            zip.putNextEntry(new ZipEntry(safePath));
            zip.closeEntry();
            for (DocumentFile child : sortedChildren(source)) {
                addToZip(resolver, child, safePath + safeName(child), zip, listener);
            }
            return;
        }

        if (listener != null) listener.onStatus("Compressing " + safeName(source));
        ZipEntry entry = new ZipEntry(safePath);
        entry.setTime(Math.max(0L, source.lastModified()));
        zip.putNextEntry(entry);
        try (InputStream input = resolver.openInputStream(source.getUri())) {
            if (input == null) throw new IOException("Could not read " + safeName(source));
            transfer(input, zip);
        }
        zip.closeEntry();
    }

    private static DocumentFile ensureZipDestination(
            DocumentFile root,
            String relativePath,
            boolean directoryEntry
    ) throws IOException {
        String[] parts = relativePath.split("/");
        DocumentFile current = root;
        for (int index = 0; index < parts.length; index++) {
            String part = sanitizeName(parts[index]);
            if (part.isBlank()) continue;
            boolean last = index == parts.length - 1;
            DocumentFile existing = current.findFile(part);
            if (last && !directoryEntry) {
                if (existing != null && !existing.delete()) {
                    throw new IOException("Could not replace " + relativePath);
                }
                DocumentFile file = current.createFile("application/octet-stream", part);
                if (file == null) throw new IOException("Could not create " + relativePath);
                return file;
            }
            if (existing != null) {
                if (!existing.isDirectory()) throw new IOException("ZIP path conflicts with a file");
                current = existing;
            } else {
                DocumentFile folder = current.createDirectory(part);
                if (folder == null) throw new IOException("Could not create ZIP folder");
                current = folder;
            }
        }
        return current;
    }

    private static String normalizeZipPath(String path) throws IOException {
        String normalized = path.replace('\\', '/');
        while (normalized.startsWith("/")) normalized = normalized.substring(1);
        String[] parts = normalized.split("/");
        StringBuilder safe = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank() || ".".equals(part)) continue;
            if ("..".equals(part)) throw new IOException("Blocked unsafe ZIP path");
            if (safe.length() > 0) safe.append('/');
            safe.append(part);
        }
        return safe.toString();
    }

    private static void copyStreams(ContentResolver resolver, Uri source, Uri target) throws IOException {
        try (InputStream input = resolver.openInputStream(source);
             OutputStream output = resolver.openOutputStream(target, "w")) {
            if (input == null || output == null) throw new IOException("Could not open copy streams");
            transfer(input, output);
        }
    }

    private static void transfer(InputStream input, OutputStream output) throws IOException {
        byte[] buffer = new byte[BUFFER_BYTES];
        int read;
        while ((read = input.read(buffer)) >= 0) {
            if (read > 0) output.write(buffer, 0, read);
        }
        output.flush();
    }

    private static String uniqueName(DocumentFile directory, String requested) {
        String clean = sanitizeName(requested);
        if (directory.findFile(clean) == null) return clean;
        String base = clean;
        String extension = "";
        int dot = clean.lastIndexOf('.');
        if (dot > 0 && dot < clean.length() - 1) {
            base = clean.substring(0, dot);
            extension = clean.substring(dot);
        }
        for (int index = 2; index < 10000; index++) {
            String candidate = base + " (" + index + ")" + extension;
            if (directory.findFile(candidate) == null) return candidate;
        }
        return base + "-" + System.currentTimeMillis() + extension;
    }

    private static String sanitizeName(String name) {
        if (name == null) return "unnamed";
        return name.replace('/', '_').replace('\\', '_').replace('\u0000', '_').trim();
    }

    private static String safeName(DocumentFile file) {
        String name = file == null ? null : file.getName();
        return name == null || name.isBlank() ? "unnamed" : name;
    }

    private static boolean sameDocument(DocumentFile left, DocumentFile right) {
        return left != null && right != null && left.getUri().equals(right.getUri());
    }

    private static void requireDirectory(DocumentFile directory) throws IOException {
        if (directory == null || !directory.exists() || !directory.isDirectory()) {
            throw new IOException("Destination directory is unavailable");
        }
    }
}
