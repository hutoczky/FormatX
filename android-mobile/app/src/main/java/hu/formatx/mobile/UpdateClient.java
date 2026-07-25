package hu.formatx.mobile;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public final class UpdateClient {
    private static final String MANIFEST_URL =
            "https://raw.githubusercontent.com/hutoczky/FormatX/master/docs/scifi-ui/downloads/android-native-update.json";

    private UpdateClient() {}

    public static final class Result {
        public final int versionCode;
        public final String versionName;
        public final String apkUrl;
        public final String sha256;
        public final String notes;

        Result(int versionCode, String versionName, String apkUrl, String sha256, String notes) {
            this.versionCode = versionCode;
            this.versionName = versionName;
            this.apkUrl = apkUrl;
            this.sha256 = sha256;
            this.notes = notes;
        }
    }

    public static Result fetch() throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(MANIFEST_URL).openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(12_000);
        connection.setReadTimeout(12_000);
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("User-Agent", "FormatX-Native-Android/1.1.0");
        connection.setUseCaches(false);
        try {
            int status = connection.getResponseCode();
            if (status < 200 || status >= 300) {
                throw new IOException("Update server returned HTTP " + status);
            }
            StringBuilder json = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                    connection.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) json.append(line);
            }
            JSONObject object = new JSONObject(json.toString());
            String url = object.optString("apkUrl", "");
            if (!url.startsWith("https://")) throw new IOException("Unsafe update URL");
            return new Result(
                    object.getInt("versionCode"),
                    object.getString("versionName"),
                    url,
                    object.optString("sha256", ""),
                    object.optString("notes", "")
            );
        } catch (IOException error) {
            throw error;
        } catch (Exception error) {
            throw new IOException("Invalid update metadata", error);
        } finally {
            connection.disconnect();
        }
    }
}
