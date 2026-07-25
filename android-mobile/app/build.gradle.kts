plugins {
    id("com.android.application")
}

android {
    namespace = "hu.formatx.mobile"
    compileSdk = 36

    defaultConfig {
        applicationId = "hu.formatx.mobile"
        minSdk = 26
        targetSdk = 36
        versionCode = 110
        versionName = "1.1.0"
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    lint {
        abortOnError = true
        checkReleaseBuilds = true
        warningsAsErrors = false
    }
}

dependencies {
    implementation("androidx.documentfile:documentfile:1.0.1")
    implementation("me.jahnen.libaums:core:0.10.0")
}
