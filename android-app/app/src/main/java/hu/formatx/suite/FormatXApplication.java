package hu.formatx.suite;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;

public final class FormatXApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        AppUpdater.checkOnStartup(this);
        registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
            @Override
            public void onActivityResumed(Activity activity) {
                AppUpdater.resumePendingInstall(activity);
            }

            @Override public void onActivityCreated(Activity activity, Bundle state) { }
            @Override public void onActivityStarted(Activity activity) { }
            @Override public void onActivityPaused(Activity activity) { }
            @Override public void onActivityStopped(Activity activity) { }
            @Override public void onActivitySaveInstanceState(Activity activity, Bundle state) { }
            @Override public void onActivityDestroyed(Activity activity) { }
        });
    }
}
