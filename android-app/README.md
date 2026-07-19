# FormatX Suite Pro for Android

Native Android wrapper for the live FormatX platform with a simplified, same-device bank-transfer checkout.

## What it does

- opens the complete live FormatX website inside a hardened WebView;
- keeps external domains outside the WebView;
- intercepts FormatX checkout links and opens a native payment screen;
- uses the same fixed HUF/EUR prices as the website and Worker;
- copies beneficiary, IBAN, amount and payment reference in one tap;
- attempts to open a `payto:` compatible banking app, with a copy-only fallback;
- submits payment confirmation to the live Worker;
- does not collect or process payment-card data.

## Unified discounted prices

| Plan | Monthly HUF | Monthly EUR | Annual HUF | Annual EUR |
|---|---:|---:|---:|---:|
| Business Lite | 15,900 Ft | 44 EUR | 139,300 Ft | 383 EUR |
| Business Pro | 39,900 Ft | 110 EUR | 349,300 Ft | 961 EUR |
| Technician Team | 79,900 Ft | 220 EUR | 699,300 Ft | 1,924 EUR |

Monthly prices are identical on the website and in the Android app. Annual prices include the larger 30% introductory discount.

## Build

The GitHub Actions workflow uses JDK 17, Gradle 9.5.0, Android Gradle Plugin 9.3.0 and Android SDK 36.

```bash
gradle --project-dir android-app :app:assembleDebug
```

APK output:

```text
android-app/app/build/outputs/apk/debug/app-debug.apk
```

The automatically built debug APK is intended for direct testing and installation. A long-term public release should use a private, persistent release signing key.
