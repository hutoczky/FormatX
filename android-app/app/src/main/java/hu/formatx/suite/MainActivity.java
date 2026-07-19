package hu.formatx.suite;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Typeface;
import android.net.Uri;
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
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.window.OnBackInvokedDispatcher;

import java.util.Locale;

public final class MainActivity extends Activity {
    private static final String PRIMARY_HOST = "formatxsuite.formatx.workers.dev";
    private static final String PRIMARY_PATH = "/";
    private static final String FALLBACK_HOST = "hutoczky.github.io";
    private static final String FALLBACK_PATH = "/FormatX/scifi-ui/index.html";
    private static final long LOAD_TIMEOUT_MS = 18000L;

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
        if (!pageVisible) {
            handleMainFrameFailure("A betöltés túllépte az időkorlátot.");
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(0xFF020711);
        getWindow().setNavigationBarColor(0xFF020711);

        setContentView(buildLayout());
        configureWebView();
        configureBackNavigation();

        if (savedInstanceState != null && webView.restoreState(savedInstanceState) != null) {
            currentHomeUri = buildUri(PRIMARY_HOST, PRIMARY_PATH);
            showLoading(false);
            scheduleTimeout();
        } else {
            loadPrimary();
        }
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
        progressBar.setProgressTintList(android.content.res.ColorStateList.valueOf(0xFF13D9FF));
        root.addView(progressBar, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(3)
        ));

        statePanel = new LinearLayout(this);
        statePanel.setOrientation(LinearLayout.VERTICAL);
        statePanel.setGravity(Gravity.CENTER);
        statePanel.setPadding(dp(28), dp(28), dp(28), dp(28));
        statePanel.setBackgroundColor(0xFF020711);

        stateTitle = makeText(24, 0xFFF4FAFF, true);
        stateMessage = makeText(15, 0xFFA9C3D7, false);
        stateMessage.setGravity(Gravity.CENTER);

        statePanel.addView(stateTitle, matchWrap());
        LinearLayout.LayoutParams messageParams = matchWrap();
        messageParams.topMargin = dp(12);
        statePanel.addView(stateMessage, messageParams);

        retryButton = makeButton("Újrapróbálás", 0xFF13D9FF, 0xFF00111D);
        retryButton.setOnClickListener(view -> loadPrimary());
        LinearLayout.LayoutParams retryParams = matchWrap();
        retryParams.topMargin = dp(22);
        statePanel.addView(retryButton, retryParams);

        browserButton = makeButton("Megnyitás böngészőben", 0xFF17395F, 0xFFF4FAFF);
        browserButton.setOnClickListener(view -> openExternal(currentHomeUri));
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
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setLoadsImagesAutomatically(true);
        settings.setBlockNetworkImage(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " FormatXAndroid/1.0.2");

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

        webView.setWebViewClient(new FormatXWebViewClient());
        webView.setWebChromeClient(new android.webkit.WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (pageVisible || newProgress >= 100) {
                    progressBar.setVisibility(View.GONE);
                } else {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }
        });
        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) ->
                openExternal(Uri.parse(url))
        );
    }

    private Uri buildUri(String host, String path) {
        String language = Locale.getDefault().getLanguage().equalsIgnoreCase("hu") ? "hu" : "en";
        return new Uri.Builder()
                .scheme("https")
                .authority(host)
                .path(path)
                .appendQueryParameter("app", "android")
                .appendQueryParameter("lang", language)
                .appendQueryParameter("appVersion", "1.0.2")
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
        showLoading(usingFallback);
        webView.loadUrl(currentHomeUri.toString());
        scheduleTimeout();
    }

    private void scheduleTimeout() {
        handler.removeCallbacks(loadTimeout);
        handler.postDelayed(loadTimeout, LOAD_TIMEOUT_MS);
    }

    private void showLoading(boolean fallback) {
        statePanel.setVisibility(View.VISIBLE);
        stateTitle.setText("FormatX betöltése…");
        stateMessage.setText(fallback
                ? "A közvetlen kapcsolat nem sikerült. A biztonságos tartalék oldal betöltése folyamatban van."
                : "Kapcsolódás a biztonságos FormatX szolgáltatáshoz.");
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
        stateTitle.setText("A FormatX oldal nem érhető el.");
        stateMessage.setText(reason + " Ellenőrizd az internetkapcsolatot, majd próbáld újra.");
        retryButton.setVisibility(View.VISIBLE);
        browserButton.setVisibility(View.VISIBLE);
    }

    private void handleMainFrameFailure(String reason) {
        handler.removeCallbacks(loadTimeout);
        if (!usingFallback) {
            loadFallback();
        } else {
            showError(reason);
        }
    }

    private boolean isCurrentRequest(Uri uri) {
        return uri != null
                && currentHomeUri != null
                && uri.getHost() != null
                && uri.getHost().equalsIgnoreCase(currentHomeUri.getHost());
    }

    private boolean isTrustedHost(String host) {
        return host != null && (
                PRIMARY_HOST.equalsIgnoreCase(host)
                        || FALLBACK_HOST.equalsIgnoreCase(host)
        );
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

        String path = uri.getPath() == null ? "" : uri.getPath();
        if (path.endsWith("/download/android")) {
            openExternal(Uri.parse("https://" + PRIMARY_HOST + "/download/android"));
            return true;
        }
        if (!isTrustedHost(uri.getHost())) {
            openExternal(uri);
            return true;
        }
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
        if (uri == null) return;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(intent);
        } catch (ActivityNotFoundException error) {
            Toast.makeText(this, "Nincs megfelelő alkalmazás a hivatkozás megnyitásához.", Toast.LENGTH_LONG).show();
        }
    }

    private void configureBackNavigation() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    this::handleBackNavigation
            );
        }
    }

    private void handleBackNavigation() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else finish();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    @SuppressLint("GestureBackNavigation")
    public void onBackPressed() {
        handleBackNavigation();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (webView != null) {
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
        }
        super.onDestroy();
    }

    private TextView makeText(int sizeSp, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setTextSize(sizeSp);
        view.setTextColor(color);
        view.setGravity(Gravity.CENTER);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return view;
    }

    private Button makeButton(String label, int background, int foreground) {
        Button button = new Button(this);
        button.setText(label);
        button.setAllCaps(false);
        button.setTextColor(foreground);
        button.setBackgroundColor(background);
        button.setMinHeight(dp(50));
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
            Uri uri = Uri.parse(url);
            if (isCurrentRequest(uri)) {
                pageVisible = false;
                showLoading(usingFallback);
                scheduleTimeout();
            }
        }

        @Override
        public void onPageCommitVisible(WebView view, String url) {
            if (isCurrentRequest(Uri.parse(url))) showPage();
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            if (isCurrentRequest(Uri.parse(url)) && view.getProgress() >= 100) showPage();
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame() && isCurrentRequest(request.getUrl())) {
                handleMainFrameFailure("Hálózati hiba történt.");
            }
        }

        @Override
        public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
            if (request.isForMainFrame() && isCurrentRequest(request.getUrl()) && response.getStatusCode() >= 400) {
                handleMainFrameFailure("HTTP " + response.getStatusCode() + " választ kaptunk.");
            }
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, android.net.http.SslError error) {
            handler.cancel();
            handleMainFrameFailure("A biztonságos kapcsolat ellenőrzése sikertelen volt.");
        }

        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            handleMainFrameFailure("Az Android WebView megjelenítőfolyamata leállt.");
            return true;
        }
    }
}
