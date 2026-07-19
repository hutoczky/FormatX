package hu.formatx.suite;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.util.Locale;

public final class MainActivity extends Activity {
    private static final String TRUSTED_HOST = "formatxsuite.formatx.workers.dev";
    private static final String HOME_PATH = "/scifi-ui/";

    private WebView webView;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(0xFF020711);
        getWindow().setNavigationBarColor(0xFF020711);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF020711);

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF020711);
        FrameLayout.LayoutParams webParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        );
        root.addView(webView, webParams);

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setProgressTintList(android.content.res.ColorStateList.valueOf(0xFF13D9FF));
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                dp(3)
        );
        root.addView(progressBar, progressParams);
        setContentView(root);

        configureWebView();

        if (savedInstanceState != null && webView.restoreState(savedInstanceState) != null) {
            return;
        }
        loadHome();
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setUserAgentString(settings.getUserAgentString() + " FormatXAndroid/1.0");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, false);

        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0);
        webView.setWebViewClient(new FormatXWebViewClient());
        webView.setWebChromeClient(new android.webkit.WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }
        });
        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) ->
                openExternal(Uri.parse(url))
        );
    }

    private void loadHome() {
        String language = Locale.getDefault().getLanguage().equalsIgnoreCase("hu") ? "hu" : "en";
        Uri uri = new Uri.Builder()
                .scheme("https")
                .authority(TRUSTED_HOST)
                .path(HOME_PATH)
                .appendQueryParameter("app", "android")
                .appendQueryParameter("lang", language)
                .build();
        webView.loadUrl(uri.toString());
    }

    private boolean handleNavigation(Uri uri) {
        if (uri == null) return true;
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);

        if ("formatx".equals(scheme)) {
            openPaymentFromUri(uri);
            return true;
        }

        if ("mailto".equals(scheme) || "tel".equals(scheme) || "payto".equals(scheme)) {
            openExternal(uri);
            return true;
        }

        if (!"http".equals(scheme) && !"https".equals(scheme)) {
            openExternal(uri);
            return true;
        }

        if (!TRUSTED_HOST.equalsIgnoreCase(uri.getHost())) {
            openExternal(uri);
            return true;
        }

        String path = uri.getPath() == null ? "" : uri.getPath();
        if (path.endsWith("/checkout.html") || path.equals("/checkout.html")) {
            openPaymentFromUri(uri);
            return true;
        }

        return false;
    }

    private void openPaymentFromUri(Uri uri) {
        Intent intent = new Intent(this, PaymentActivity.class);
        intent.putExtra("plan", safeValue(uri.getQueryParameter("plan"), "business_pro"));
        intent.putExtra("cycle", safeValue(uri.getQueryParameter("cycle"), "monthly"));
        intent.putExtra("currency", safeValue(uri.getQueryParameter("currency"), "HUF"));
        intent.putExtra("lang", safeValue(uri.getQueryParameter("lang"),
                Locale.getDefault().getLanguage().equalsIgnoreCase("hu") ? "hu" : "en"));
        startActivity(intent);
    }

    private static String safeValue(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value;
    }

    private void openExternal(Uri uri) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(intent);
        } catch (ActivityNotFoundException error) {
            Toast.makeText(this, "Nincs megfelelő alkalmazás a hivatkozás megnyitásához.", Toast.LENGTH_LONG).show();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
        }
        super.onDestroy();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private final class FormatXWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return handleNavigation(request.getUrl());
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleNavigation(Uri.parse(url));
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            progressBar.setVisibility(View.VISIBLE);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            progressBar.setVisibility(View.GONE);
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, android.net.http.SslError error) {
            handler.cancel();
            Toast.makeText(MainActivity.this, "A biztonságos kapcsolat ellenőrzése sikertelen.", Toast.LENGTH_LONG).show();
        }
    }
}
