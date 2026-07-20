package hu.formatx.suite;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

final class AppUpdater {
    private static final String PRIMARY_MANIFEST =
            "https://www.formatxsuite.com/scifi-ui/downloads/android-update.json";
    private static final String FALLBACK_MANIFEST =
            "https://raw.githubusercontent.com/hutoczky/FormatX/master/docs/scifi-ui/downloads/android-update.json";
    private static final String PREFS = "formatx_updater";
    private static final String KEY_DOWNLOAD_ID = "download_id";
    private static final String KEY_SHA256 = "sha256";
    private static final String KEY_VERSION = "version";
    private static final String KEY_INSTALL_PENDING = "install_pending";

    private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();
    private static final Handler MAIN = new Handler(Looper.getMainLooper());
    private static final AtomicBoolean CHECKING = new AtomicBoolean(false);
    private static final AtomicBoolean RECEIVER_REGISTERED = new AtomicBoolean(false);

    private AppUpdater() { }

    static void checkOnStartup(Context source) {
        Context context = source.getApplicationContext();
        registerDownloadReceiver(context);

        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String downloadedVersion = prefs.getString(KEY_VERSION, "");
        if (BuildConfig.VERSION_NAME.equals(downloadedVersion)) {
            clearPending(context);
        } else {
            resumeExistingDownload(context);
            resumePendingInstall(context);
        }

        if (!CHECKING.compareAndSet(false, true)) return;
        EXECUTOR.execute(() -> {
            try {
                UpdateInfo info = fetchUpdateInfo();
                if (info.versionCode > BuildConfig.VERSION_CODE) {
                    enqueueUpdate(context, info);
                }
            } catch (Exception ignored) {
                // A frissítésellenőrzés nem akadályozhatja az alkalmazás indulását.
            } finally {
                CHECKING.set(false);
            }
        });
    }

    static void resumePendingInstall(Context source) {
        Context context = source.getApplicationContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_INSTALL_PENDING, false)) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                && !context.getPackageManager().canRequestPackageInstalls()) {
            return;
        }

        long downloadId = prefs.getLong(KEY_DOWNLOAD_ID, -1L);
        if (downloadId > 0) installDownloadedApk(context, downloadId);
    }

    private static void resumeExistingDownload(Context context) {
        long downloadId = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getLong(KEY_DOWNLOAD_ID, -1L);
        if (downloadId <= 0) return;

        DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
        try (Cursor cursor = manager.query(new DownloadManager.Query().setFilterById(downloadId))) {
            if (!cursor.moveToFirst()) {
                clearPending(context);
                return;
            }
            int status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
            if (status == DownloadManager.STATUS_SUCCESSFUL) {
                verifyAndInstall(context, downloadId);
            } else if (status == DownloadManager.STATUS_FAILED) {
                clearPending(context);
            }
        }
    }

    private static UpdateInfo fetchUpdateInfo() throws Exception {
        Exception primaryFailure;
        try {
            return fetchManifest(PRIMARY_MANIFEST);
        } catch (Exception error) {
            primaryFailure = error;
        }
        try {
            return fetchManifest(FALLBACK_MANIFEST);
        } catch (Exception fallbackFailure) {
            fallbackFailure.addSuppressed(primaryFailure);
            throw fallbackFailure;
        }
    }

    private static UpdateInfo fetchManifest(String manifestUrl) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(manifestUrl).openConnection();
        connection.setConnectTimeout(8000);
        connection.setReadTimeout(8000);
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("User-Agent", "FormatXAndroid/" + BuildConfig.VERSION_NAME);
        connection.setInstanceFollowRedirects(true);

        try {
            int status = connection.getResponseCode();
            if (status < 200 || status >= 300) {
                throw new IllegalStateException("Update manifest HTTP " + status);
            }
            String json;
            try (InputStream stream = new BufferedInputStream(connection.getInputStream())) {
                json = readUtf8(stream);
            }
            JSONObject object = new JSONObject(json);
            return new UpdateInfo(
                    object.getInt("versionCode"),
                    object.getString("versionName"),
                    object.getString("apkUrl"),
                    object.getString("sha256").toLowerCase(Locale.ROOT)
            );
        } finally {
            connection.disconnect();
        }
    }

    private static String readUtf8(InputStream stream) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[16 * 1024];
        int count;
        while ((count = stream.read(buffer)) >= 0) {
            if (count > 0) output.write(buffer, 0, count);
        }
        return output.toString("UTF-8");
    }

    private static void enqueueUpdate(Context context, UpdateInfo info) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        long existingId = prefs.getLong(KEY_DOWNLOAD_ID, -1L);
        String existingVersion = prefs.getString(KEY_VERSION, "");
        if (existingId > 0 && info.versionName.equals(existingVersion)) return;

        DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(info.apkUrl));
        request.setTitle("FormatX " + info.versionName + " frissítés");
        request.setDescription("A FormatX új verziójának letöltése");
        request.setMimeType("application/vnd.android.package-archive");
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        request.setAllowedOverMetered(true);
        request.setAllowedOverRoaming(false);
        request.setDestinationInExternalFilesDir(
                context,
                Environment.DIRECTORY_DOWNLOADS,
                "FormatX-Suite-Pro-Android-" + info.versionName + ".apk"
        );

        long id = manager.enqueue(request);
        prefs.edit()
                .putLong(KEY_DOWNLOAD_ID, id)
                .putString(KEY_SHA256, info.sha256)
                .putString(KEY_VERSION, info.versionName)
                .putBoolean(KEY_INSTALL_PENDING, false)
                .apply();

        notifyUser(context, "Új FormatX verzió érhető el. A frissítés letöltése elindult.");
    }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    private static void registerDownloadReceiver(Context context) {
        if (!RECEIVER_REGISTERED.compareAndSet(false, true)) return;

        BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context receiverContext, Intent intent) {
                if (!DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(intent.getAction())) return;
                long completedId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L);
                SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
                if (completedId != prefs.getLong(KEY_DOWNLOAD_ID, -2L)) return;
                verifyAndInstall(context, completedId);
            }
        };

        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            context.registerReceiver(receiver, filter);
        }
    }

    private static void verifyAndInstall(Context context, long downloadId) {
        EXECUTOR.execute(() -> {
            DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
            try (Cursor cursor = manager.query(new DownloadManager.Query().setFilterById(downloadId))) {
                if (!cursor.moveToFirst()) return;
                int status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
                if (status != DownloadManager.STATUS_SUCCESSFUL) {
                    if (status == DownloadManager.STATUS_FAILED) clearPending(context);
                    return;
                }
            }

            Uri apkUri = manager.getUriForDownloadedFile(downloadId);
            if (apkUri == null) {
                clearPending(context);
                return;
            }

            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String expected = prefs.getString(KEY_SHA256, "");
            try {
                String actual = sha256(context, apkUri);
                if (expected == null || expected.length() != 64 || !MessageDigest.isEqual(
                        expected.getBytes(java.nio.charset.StandardCharsets.US_ASCII),
                        actual.getBytes(java.nio.charset.StandardCharsets.US_ASCII)
                )) {
                    clearPending(context);
                    notifyUser(context, "A FormatX frissítés SHA-256 ellenőrzése sikertelen.");
                    return;
                }
            } catch (Exception error) {
                clearPending(context);
                notifyUser(context, "A FormatX frissítés nem ellenőrizhető.");
                return;
            }

            prefs.edit().putBoolean(KEY_INSTALL_PENDING, true).apply();
            requestInstallPermissionOrInstall(context, downloadId);
        });
    }

    private static String sha256(Context context, Uri uri) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream stream = context.getContentResolver().openInputStream(uri)) {
            if (stream == null) throw new IllegalStateException("Downloaded APK is unavailable");
            byte[] buffer = new byte[64 * 1024];
            int count;
            while ((count = stream.read(buffer)) >= 0) {
                if (count > 0) digest.update(buffer, 0, count);
            }
        }
        StringBuilder result = new StringBuilder(64);
        for (byte value : digest.digest()) result.append(String.format(Locale.ROOT, "%02x", value));
        return result.toString();
    }

    private static void requestInstallPermissionOrInstall(Context context, long downloadId) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                && !context.getPackageManager().canRequestPackageInstalls()) {
            Intent settings = new Intent(
                    Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + context.getPackageName())
            );
            settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(settings);
            notifyUser(
                    context,
                    "Engedélyezd a FormatX számára az alkalmazásfrissítések telepítését, majd térj vissza."
            );
            return;
        }
        installDownloadedApk(context, downloadId);
    }

    private static void installDownloadedApk(Context context, long downloadId) {
        DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
        Uri apkUri = manager.getUriForDownloadedFile(downloadId);
        if (apkUri == null) {
            clearPending(context);
            return;
        }

        Intent install = new Intent(Intent.ACTION_INSTALL_PACKAGE);
        install.setData(apkUri);
        install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            context.startActivity(install);
        } catch (ActivityNotFoundException error) {
            Intent fallback = new Intent(Intent.ACTION_VIEW);
            fallback.setDataAndType(apkUri, "application/vnd.android.package-archive");
            fallback.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(fallback);
        }
    }

    private static void notifyUser(Context context, String message) {
        MAIN.post(() -> Toast.makeText(context, message, Toast.LENGTH_LONG).show());
    }

    private static void clearPending(Context context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .remove(KEY_DOWNLOAD_ID)
                .remove(KEY_SHA256)
                .remove(KEY_VERSION)
                .remove(KEY_INSTALL_PENDING)
                .apply();
    }

    private static final class UpdateInfo {
        final int versionCode;
        final String versionName;
        final String apkUrl;
        final String sha256;

        UpdateInfo(int versionCode, String versionName, String apkUrl, String sha256) {
            this.versionCode = versionCode;
            this.versionName = versionName;
            this.apkUrl = apkUrl;
            this.sha256 = sha256;
        }
    }
}
