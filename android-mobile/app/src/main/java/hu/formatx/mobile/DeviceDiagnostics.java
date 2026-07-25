package hu.formatx.mobile;

import android.app.ActivityManager;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Environment;
import android.os.StatFs;
import android.os.storage.StorageManager;
import android.os.storage.StorageVolume;

import java.util.List;
import java.util.Locale;

public final class DeviceDiagnostics {
    private DeviceDiagnostics() {}

    public static String collect(Context context, boolean hungarian) {
        StringBuilder report = new StringBuilder();
        report.append("FORMATX NATIVE ANDROID DIAGNOSTICS\n\n");
        add(report, hungarian ? "Gyártó" : "Manufacturer", Build.MANUFACTURER);
        add(report, hungarian ? "Modell" : "Model", Build.MODEL);
        add(report, "Android", Build.VERSION.RELEASE + " · API " + Build.VERSION.SDK_INT);
        add(report, "Build", Build.DISPLAY);
        add(report, "ABI", String.join(", ", Build.SUPPORTED_ABIS));
        add(report, hungarian ? "Processzor magok" : "CPU cores",
                String.valueOf(Runtime.getRuntime().availableProcessors()));

        ActivityManager activityManager =
                (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        ActivityManager.MemoryInfo memory = new ActivityManager.MemoryInfo();
        activityManager.getMemoryInfo(memory);
        add(report, hungarian ? "RAM összesen" : "Total RAM", UsbOperations.humanBytes(memory.totalMem));
        add(report, hungarian ? "RAM szabad" : "Available RAM", UsbOperations.humanBytes(memory.availMem));
        add(report, hungarian ? "Kevés memória" : "Low-memory state", yesNo(memory.lowMemory, hungarian));

        StatFs internal = new StatFs(Environment.getDataDirectory().getAbsolutePath());
        add(report, hungarian ? "Belső tárhely összesen" : "Internal storage total",
                UsbOperations.humanBytes(internal.getTotalBytes()));
        add(report, hungarian ? "Belső tárhely szabad" : "Internal storage free",
                UsbOperations.humanBytes(internal.getAvailableBytes()));

        BatteryManager battery = (BatteryManager) context.getSystemService(Context.BATTERY_SERVICE);
        int level = battery.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
        int status = battery.getIntProperty(BatteryManager.BATTERY_PROPERTY_STATUS);
        add(report, hungarian ? "Akkumulátor" : "Battery", level >= 0 ? level + "%" : "n/a");
        add(report, hungarian ? "Töltési állapot" : "Charging state", batteryState(status, hungarian));

        SensorManager sensors = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        List<Sensor> sensorList = sensors.getSensorList(Sensor.TYPE_ALL);
        add(report, hungarian ? "Érzékelők" : "Sensors", String.valueOf(sensorList.size()));

        ConnectivityManager connectivity =
                (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        add(report, hungarian ? "Aktív hálózat" : "Active network",
                networkSummary(connectivity, hungarian));

        report.append('\n').append(hungarian ? "Tárhely-kötetek" : "Storage volumes").append(":\n");
        StorageManager storageManager =
                (StorageManager) context.getSystemService(Context.STORAGE_SERVICE);
        for (StorageVolume volume : storageManager.getStorageVolumes()) {
            report.append("• ")
                    .append(volume.getDescription(context))
                    .append(" · ")
                    .append(volume.isRemovable() ? (hungarian ? "eltávolítható" : "removable")
                            : (hungarian ? "belső" : "internal"))
                    .append(" · ")
                    .append(volume.getState())
                    .append('\n');
        }

        List<android.hardware.usb.UsbDevice> usb = RawUsbMassStorageDevice.discover(context);
        report.append('\n').append(hungarian ? "OTG USB-tárolók" : "OTG USB storage").append(": ")
                .append(usb.size()).append('\n');
        for (android.hardware.usb.UsbDevice device : usb) {
            report.append("• ").append(RawUsbMassStorageDevice.displayName(device)).append('\n');
        }

        report.append('\n').append(hungarian
                ? "Megjegyzés: a normál Android-alkalmazás nem kap közvetlen hozzáférést a telefon belső fizikai lemezéhez vagy SMART-parancsaihoz."
                : "Note: a normal Android application does not receive raw access to the phone's internal physical disk or SMART commands.");
        return report.toString();
    }

    private static void add(StringBuilder report, String name, String value) {
        report.append(name).append(": ").append(value == null ? "n/a" : value).append('\n');
    }

    private static String yesNo(boolean value, boolean hungarian) {
        if (hungarian) return value ? "igen" : "nem";
        return value ? "yes" : "no";
    }

    private static String batteryState(int status, boolean hungarian) {
        if (status == BatteryManager.BATTERY_STATUS_CHARGING) return hungarian ? "töltés" : "charging";
        if (status == BatteryManager.BATTERY_STATUS_FULL) return hungarian ? "feltöltve" : "full";
        if (status == BatteryManager.BATTERY_STATUS_DISCHARGING) return hungarian ? "merül" : "discharging";
        if (status == BatteryManager.BATTERY_STATUS_NOT_CHARGING) return hungarian ? "nem tölt" : "not charging";
        return hungarian ? "ismeretlen" : "unknown";
    }

    private static String networkSummary(ConnectivityManager manager, boolean hungarian) {
        Network network = manager.getActiveNetwork();
        if (network == null) return hungarian ? "nincs" : "none";
        NetworkCapabilities capabilities = manager.getNetworkCapabilities(network);
        if (capabilities == null) return hungarian ? "ismeretlen" : "unknown";
        String transport;
        if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) transport = "Wi-Fi";
        else if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) transport = hungarian ? "mobilhálózat" : "cellular";
        else if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) transport = "Ethernet";
        else if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) transport = "VPN";
        else transport = hungarian ? "egyéb" : "other";
        boolean internet = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED);
        return String.format(Locale.ROOT, "%s · %s", transport,
                internet ? (hungarian ? "internet elérhető" : "internet available")
                        : (hungarian ? "nincs igazolt internet" : "internet not validated"));
    }
}
