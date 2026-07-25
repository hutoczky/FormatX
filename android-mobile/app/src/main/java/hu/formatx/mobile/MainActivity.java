package hu.formatx.mobile;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Typeface;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.util.Locale;

public final class MainActivity extends Activity {
    private static final String PRIMARY_HOST = "www.formatxsuite.com";
    private static final String PRIMARY_PATH = "/scifi-ui/android/";
    private static final String FALLBACK_HOST = "hutoczky.github.io";
    private static final String FALLBACK_PATH = "/FormatX/scifi-ui/android/";
    private static final String APP_VERSION = "1.0.0";
    private static final long LOAD_TIMEOUT_MS = 18_000L;

    private final Handler handler = new Handler(Looper.getMainLooper());

    private WebView webView;
    private ProgressBar progressBar;
    private LinearLayout statePanel;
    private TextView stateTitle;
    private TextView stateMessage;
    private Button retryButton;
    private Button browserButton;

    private Uri currentHomeUri;
    private boolean usingFallback;
    private boolean pageVisible;

    private final Runnable loadTimeout = () -> {
        if (!pageVisible) handleMainFrameFailure(text(
                "A mobilfelület betöltése túllépte az időkorlátot.",
                "The mobile interface exceeded the loading time limit."
        ));
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(0xFF020711);
        getWindow().setNavigationBarColor(0xFF020711);
        setContentView(buildLayout());
        configureWebView();
        loadPrimary();
    }

    private View buildLayout() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF020711);

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF020711);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setProgressTintList(android.content.res.ColorStateList.valueOf(0xFF42DDFF));
        root.addView(progressBar, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(3)
        ));

        statePanel = new LinearLayout(this);
        statePanel.setOrientation(LinearLayout.VERTICAL);
        statePanel.setGravity(Gravity.CENTER);
        statePanel.setPadding(dp(28), dp(28), dp(28), dp(28));
        statePanel.setBackgroundColor(0xFF020711);

        stateTitle = makeText(24, 0xFFF5F8FF, true);
        stateTitle.setGravity(Gravity.CENTER);
        stateMessage = makeText(15, 0xFFB7C5D8, false);
        stateMessage.setGravity(Gravity.CENTER);

        statePanel.addView(stateTitle, matchWrap());
        LinearLayout.LayoutParams messageParams = matchWrap();
        messageParams.topMargin = dp(12);
        statePanel.addView(stateMessage, messageParams);

        retryButton = makeButton(text("Újrapróbálás", "Retry"), 0xFF42DDFF, 0xFF00111D);
        retryButton.setOnClickListener(view -> loadPrimary());
        LinearLayout.LayoutParams retryParams = matchWrap();
        retryParams.topMargin = dp(22);
        statePanel.addView(retryButton, retryParams);

        browserButton = makeButton(text("Megnyitás böngészőben", "Open in browser"), 0xFF17395F, 0xFFF5F8FF);
        browserButton.setOnClickListener(view -> openExternal(buildUri(PRIMARY_HOST, PRIMARY_PATH)));
        LinearLayout.LayoutParams browserParams = matchWrap();
        browserParams.topMargin = dp(10);
        statePanel.addView(browserButton, browserParams);

        root.addView(statePanel, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        return root;
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setTextZoom(100);
        settings.setDefaultFontSize(16);
        settings.setMinimumFontSize(12);
        settings.setLoadsImagesAutomatically(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " FormatXMobileAndroid/" + APP_VERSION);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);
        }

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(webView, false);

        WebView.setWebContentsDebuggingEnabled(
                (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
        );

        webView.setWebViewClient(new MobileWebViewClient());
        webView.setWebChromeClient(new android.webkit.WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(pageVisible || newProgress >= 100 ? View.GONE : View.VISIBLE);
            }
        });
        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) ->
                openExternal(Uri.parse(url))
        );
    }

    private Uri buildUri(String host, String path) {
        return new Uri.Builder()
                .scheme("https")
                .authority(host)
                .path(path)
                .appendQueryParameter("app", "android-mobile")
                .appendQueryParameter("lang", isHungarian() ? "hu" : "en")
                .appendQueryParameter("appVersion", APP_VERSION)
                .appendQueryParameter("cacheBust", "100")
                .build();
    }

    private void loadPrimary() {
        usingFallback = false;
        currentHomeUri = buildUri(PRIMARY_HOST, PRIMARY_PATH);
        loadCurrentUri();
    }

    private void loadFallback() {
        usingFallback = true;
        currentHomeUri = buildUri(FALLBACK_HOST, FALLBACK_PATH);
        loadCurrentUri();
    }

    private void loadCurrentUri() {
        pageVisible = false;
        handler.removeCallbacks(loadTimeout);
        webView.stopLoading();
        showLoading();
        webView.loadUrl(currentHomeUri.toString());
        handler.postDelayed(loadTimeout, LOAD_TIMEOUT_MS);
    }

    private void showLoading() {
        statePanel.setVisibility(View.VISIBLE);
        stateTitle.setText(text("FormatX Mobile betöltése…", "Loading FormatX Mobile…"));
        stateMessage.setText(usingFallback
                ? text("A tartalék GitHub-oldal betöltése folyamatban van.", "Loading the fallback GitHub page.")
                : text("Kapcsolódás a FormatX mobilfelülethez.", "Connecting to the FormatX mobile interface."));
        retryButton.setVisibility(View.GONE);
        browserButton.setVisibility(View.GONE);
        progressBar.setVisibility(View.VISIBLE);
    }

    private void showPage() {
        pageVisible = true;
        handler.removeCallbacks(loadTimeout);
        progressBar.setVisibility(View.GONE);
        statePanel.setVisibility(View.GONE);
    }

    private void showError(String reason) {
        pageVisible = false;
        handler.removeCallbacks(loadTimeout);
        progressBar.setVisibility(View.GONE);
        statePanel.setVisibility(View.VISIBLE);
        stateTitle.setText(text("A FormatX Mobile nem érhető el.", "FormatX Mobile is unavailable."));
        stateMessage.setText(reason + " " + text(
                "Ellenőrizd az internetkapcsolatot, majd próbáld újra.",
                "Check the internet connection and try again."
        ));
        retryButton.setVisibility(View.VISIBLE);
        browserButton.setVisibility(View.VISIBLE);
    }

    private void handleMainFrameFailure(String reason) {
        handler.removeCallbacks(loadTimeout);
        if (!usingFallback) loadFallback();
        else showError(reason);
    }

    private void verifyLandingPage(WebView view) {
        view.evaluateJavascript(
                "(function(){return !!(document.body && document.body.classList.contains('formatx-android'));})()",
                result -> {
                    if ("true".equals(result)) showPage();
                    else if (!usingFallback) loadFallback();
                    else showError(text(
                            "A kiszolgáló nem a megfelelő Android-felületet adta vissza.",
                            "The server did not return the expected Android interface."
                    ));
                }
        );
    }

    private boolean isTrustedHost(String host) {
        return host != null && (
                PRIMARY_HOST.equalsIgnoreCase(host)
                        || "formatxsuite.com".equalsIgnoreCase(host)
                        || FALLBACK_HOST.equalsIgnoreCase(host)
        );
    }

    private boolean handleNavigation(Uri uri) {
        if (uri == null) return true;
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if ("mailto".equals(scheme) || "tel".equals(scheme)) {
            openExternal(uri);
            return true;
        }
        if (!"http".equals(scheme) && !"https".equals(scheme)) {
            openExternal(uri);
            return true;
        }

        String path = uri.getPath() == null ? "" : uri.getPath().toLowerCase(Locale.ROOT);
        if (path.endsWith(".apk") || path.contains("/download/")) {
            openExternal(uri);
            return true;
        }
        if (!isTrustedHost(uri.getHost())) {
            openExternal(uri);
            return true;
        }
        return false;
    }

    private void openExternal(Uri uri) {
        if (uri == null) return;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(intent);
        } catch (ActivityNotFoundException error) {
            Toast.makeText(this, text(
                    "Nincs megfelelő alkalmazás a hivatkozás megnyitásához.",
                    "No application can open this link."
            ), Toast.LENGTH_LONG).show();
        }
    }

    private final class MobileWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return handleNavigation(request.getUrl());
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleNavigation(Uri.parse(url));
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            verifyLandingPage(view);
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            super.onReceivedError(view, request, error);
            if (request.isForMainFrame()) {
                handleMainFrameFailure(text("Hálózati betöltési hiba.", "Network loading error."));
            }
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
            handler.cancel();
            handleMainFrameFailure(text("A TLS-tanúsítvány ellenőrzése sikertelen.", "TLS certificate validation failed."));
        }

        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            showError(text("Az Android WebView folyamata leállt.", "The Android WebView process stopped."));
            return true;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (webView != null) {
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private boolean isHungarian() {
        return Locale.getDefault().getLanguage().equalsIgnoreCase("hu");
    }

    private String text(String hu, String en) {
        return isHungarian() ? hu : en;
    }

    private TextView makeText(int sizeSp, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setTextSize(sizeSp);
        view.setTextColor(color);
        view.setTypeface(Typeface.DEFAULT, bold ? Typeface.BOLD : Typeface.NORMAL);
        return view;
    }

    private Button makeButton(String label, int background, int foreground) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextColor(foreground);
        button.setBackgroundTintList(android.content.res.ColorStateList.valueOf(background));
        button.setAllCaps(false);
        button.setMinHeight(dp(48));
        return button;
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
