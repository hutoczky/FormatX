plugins {
    id("com.android.application")
}

android {
    namespace = "hu.formatx.suite"
    compileSdk = 36

    defaultConfig {
        applicationId = "hu.formatx.suite"
        minSdk = 26
        targetSdk = 36
        versionCode = 5
        versionName = "1.0.3"
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
