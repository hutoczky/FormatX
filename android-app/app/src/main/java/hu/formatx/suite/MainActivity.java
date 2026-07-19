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
    private static final String TRUSTED_HOST = "formatxsuite.formatx.workers.dev";
    private static final String HOME_PATH = "/scifi-ui/index.html";
    private static final long LOAD_TIMEOUT_MS = 18000L;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private WebView webView;
    private ProgressBar progressBar;
    private LinearLayout statePanel;
    private TextView stateTitle;
    private TextView stateMessage;
    private Button retryButton;
    private Button browserButton;
    private Uri homeUri;
    private boolean pageVisible;

    private final Runnable loadTimeout = () -> {
        if (!pageVisible) {
            showError(
                    "A FormatX oldal nem töltődött be időben.",
                    "Ellenőrizd az internetkapcsolatot, majd próbáld újra. A weboldal külső böngészőben is megnyitható."
            );
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(0xFF020711);
        getWindow().setNavigationBarColor(0xFF020711);
        homeUri = buildHomeUri();
        setContentView(buildLayout());
        configureWebView();
        configureBackNavigation();

        if (savedInstanceState != null && webView.restoreState(savedInstanceState) != null) {
            showLoading();
            scheduleTimeout();
            return;
        }
        loadHome();
    }

    private View buildLayout() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF020711);

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF020711);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setProgressTintList(android.content.res.ColorStateList.valueOf(0xFF13D9FF));
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(3)
        );
        root.addView(progressBar, progressParams);

        statePanel = new LinearLayout(this);
        statePanel.setOrientation(LinearLayout.VERTICAL);
        statePanel.setGravity(Gravity.CENTER);
        statePanel.setPadding(dp(28), dp(28), dp(28), dp(28));
        statePanel.setBackgroundColor(0xFF020711);

        stateTitle = textView(24, 0xFFF4FAFF, true);
        stateMessage = textView(15, 0xFFA9C3D7, false);
        stateMessage.setGravity(Gravity.CENTER);
        statePanel.addView(stateTitle, matchWrap());
        LinearLayout.LayoutParams messageParams = matchWrap();
        messageParams.topMargin = dp(12);
        statePanel.addView(stateMessage, messageParams);

        retryButton = button("Újrapróbálás", 0xFF13D9FF, 0xFF00111D);
        retryButton.setOnClickListener(view -> loadHome());
        LinearLayout.LayoutParams retryParams = matchWrap();
        retryParams.topMargin = dp(22);
        statePanel.addView(retryButton, retryParams);

        browserButton = button("Megnyitás böngészőben", 0xFF17395F, 0xFFF4FAFF);
        browserButton.setOnClickListener(view -> openExternal(homeUri));
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
        settings.setUserAgentString(settings.getUserAgentString() + " FormatXAndroid/1.0.1");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);
        }

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, false);

        WebView.setWebContentsDebuggingEnabled(
                (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
        );
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

    private Uri buildHomeUri() {
        String language = Locale.getDefault().getLanguage().equalsIgnoreCase("hu") ? "hu" : "en";
        return new Uri.Builder()
                .scheme("https")
                .authority(TRUSTED_HOST)
                .path(HOME_PATH)
                .appendQueryParameter("app", "android")
                .appendQueryParameter("lang", language)
                .appendQueryParameter("appVersion", "1.0.1")
                .build();
    }

    private void loadHome() {
        pageVisible = false;
        showLoading();
        handler.removeCallbacks(loadTimeout);
        webView.stopLoading();
        webView.loadUrl(homeUri.toString());
        scheduleTimeout();
    }

    private void scheduleTimeout() {
        handler.removeCallbacks(loadTimeout);
        handler.postDelayed(loadTimeout, LOAD_TIMEOUT_MS);
    }

    private void showLoading() {
        statePanel.setVisibility(View.VISIBLE);
        stateTitle.setText("FormatX betöltése…");
        stateMessage.setText("Kapcsolódás a biztonságos FormatX szolgáltatáshoz.");
        retryButton.setVisibility(View.GONE);
        browserButton.setVisibility(View.GONE);
        progressBar.setVisibility(View.VISIBLE);
    }

    private void showError(String title, String message) {
        pageVisible = false;
        handler.removeCallbacks(loadTimeout);
        progressBar.setVisibility(View.GONE);
        statePanel.setVisibility(View.VISIBLE);
        stateTitle.setText(title);
        stateMessage.setText(message);
        retryButton.setVisibility(View.VISIBLE);
        browserButton.setVisibility(View.VISIBLE);
    }

    private void showPage() {
        pageVisible = true;
        handler.removeCallbacks(loadTimeout);
        progressBar.setVisibility(View.GONE);
        statePanel.setVisibility(View.GONE);
    }

    private void configureBackNavigation() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    this::handleBackNavigation
            );
        }
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

    private TextView textView(int sizeSp, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setTextSize(sizeSp);
        view.setTextColor(color);
        view.setGravity(Gravity.CENTER);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return view;
    }

    private Button button(String label, int background, int foreground) {
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
            pageVisible = false;
            showLoading();
            scheduleTimeout();
        }

        @Override
        public void onPageCommitVisible(WebView view, String url) {
            showPage();
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            if (view.getProgress() >= 100) showPage();
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) {
                showError("A FormatX oldal nem érhető el.", "Hálózati hiba történt. Próbáld újra, vagy nyisd meg böngészőben.");
            }
        }

        @Override
        public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
            if (request.isForMainFrame() && response.getStatusCode() >= 400) {
                showError("A FormatX oldal hibát jelzett.", "HTTP " + response.getStatusCode() + " választ kaptunk. Próbáld újra később.");
            }
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler sslHandler, android.net.http.SslError error) {
            sslHandler.cancel();
            showError("A biztonságos kapcsolat sikertelen.", "A tanúsítvány ellenőrzése nem sikerült, ezért az alkalmazás megszakította a kapcsolatot.");
        }

        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            showError("A webes megjelenítő leállt.", "Az Android WebView folyamat leállt. Indítsd újra az alkalmazást vagy nyisd meg böngészőben.");
            return true;
        }
    }
}
