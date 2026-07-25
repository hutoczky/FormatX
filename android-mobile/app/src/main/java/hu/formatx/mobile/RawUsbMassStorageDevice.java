package hu.formatx.mobile;

import android.content.Context;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;

import java.io.Closeable;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

import me.jahnen.libaums.core.driver.BlockDeviceDriver;
import me.jahnen.libaums.core.driver.BlockDeviceDriverFactory;
import me.jahnen.libaums.core.usb.UsbCommunication;
import me.jahnen.libaums.core.usb.UsbCommunicationFactory;

/**
 * Raw block access for USB mass-storage devices attached through Android USB Host/OTG.
 * This class never exposes or targets the phone's internal block devices.
 */
public final class RawUsbMassStorageDevice implements Closeable {
    public static final int MASS_STORAGE_SUBCLASS_SCSI = 6;
    public static final int MASS_STORAGE_PROTOCOL_BULK_ONLY = 80;

    private final UsbDevice usbDevice;
    private final UsbCommunication communication;
    private final BlockDeviceDriver blockDevice;

    private RawUsbMassStorageDevice(
            UsbDevice usbDevice,
            UsbCommunication communication,
            BlockDeviceDriver blockDevice
    ) {
        this.usbDevice = usbDevice;
        this.communication = communication;
        this.blockDevice = blockDevice;
    }

    public static List<UsbDevice> discover(Context context) {
        UsbManager manager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
        List<UsbDevice> result = new ArrayList<>();
        for (UsbDevice device : manager.getDeviceList().values()) {
            if (findMassStorageInterface(device) != null) {
                result.add(device);
            }
        }
        return result;
    }

    public static RawUsbMassStorageDevice open(Context context, UsbDevice device) throws IOException {
        UsbManager manager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
        if (!manager.hasPermission(device)) {
            throw new SecurityException("Missing USB permission for " + displayName(device));
        }

        UsbInterface usbInterface = findMassStorageInterface(device);
        if (usbInterface == null) {
            throw new IOException("Unsupported USB mass-storage interface");
        }

        UsbEndpoint inEndpoint = null;
        UsbEndpoint outEndpoint = null;
        for (int index = 0; index < usbInterface.getEndpointCount(); index++) {
            UsbEndpoint endpoint = usbInterface.getEndpoint(index);
            if (endpoint.getType() != UsbConstants.USB_ENDPOINT_XFER_BULK) {
                continue;
            }
            if (endpoint.getDirection() == UsbConstants.USB_DIR_IN) {
                inEndpoint = endpoint;
            } else if (endpoint.getDirection() == UsbConstants.USB_DIR_OUT) {
                outEndpoint = endpoint;
            }
        }

        if (inEndpoint == null || outEndpoint == null) {
            throw new IOException("USB bulk endpoints are missing");
        }

        UsbCommunication communication = null;
        try {
            communication = UsbCommunicationFactory.INSTANCE.createUsbCommunication(
                    manager,
                    device,
                    usbInterface,
                    outEndpoint,
                    inEndpoint
            );
            BlockDeviceDriver driver = BlockDeviceDriverFactory.INSTANCE.createBlockDevice(
                    communication,
                    (byte) 0
            );
            driver.init();
            return new RawUsbMassStorageDevice(device, communication, driver);
        } catch (Exception error) {
            if (communication != null) {
                try {
                    communication.close();
                } catch (Exception ignored) {
                    // Preserve the original initialization failure.
                }
            }
            if (error instanceof IOException) {
                throw (IOException) error;
            }
            throw new IOException("Could not initialize USB block device", error);
        }
    }

    private static UsbInterface findMassStorageInterface(UsbDevice device) {
        for (int index = 0; index < device.getInterfaceCount(); index++) {
            UsbInterface usbInterface = device.getInterface(index);
            if (usbInterface.getInterfaceClass() == UsbConstants.USB_CLASS_MASS_STORAGE
                    && usbInterface.getInterfaceSubclass() == MASS_STORAGE_SUBCLASS_SCSI
                    && usbInterface.getInterfaceProtocol() == MASS_STORAGE_PROTOCOL_BULK_ONLY) {
                return usbInterface;
            }
        }
        return null;
    }

    public UsbDevice getUsbDevice() {
        return usbDevice;
    }

    public int getBlockSize() {
        return blockDevice.getBlockSize();
    }

    public long getBlockCount() {
        // libaums exposes the last logical block address, not a zero-based count.
        return blockDevice.getBlocks() + 1L;
    }

    public long getCapacityBytes() {
        return Math.multiplyExact(getBlockCount(), (long) getBlockSize());
    }

    public void readBlocks(long firstBlock, ByteBuffer target) throws IOException {
        if (target.remaining() % getBlockSize() != 0) {
            throw new IllegalArgumentException("Read buffer must be block aligned");
        }
        blockDevice.read(firstBlock, target);
    }

    public void writeBlocks(long firstBlock, ByteBuffer source) throws IOException {
        if (source.remaining() % getBlockSize() != 0) {
            throw new IllegalArgumentException("Write buffer must be block aligned");
        }
        blockDevice.write(firstBlock, source);
    }

    @Override
    public void close() {
        try {
            communication.close();
        } catch (Exception ignored) {
            // Device detach and already-closed connections are expected during cleanup.
        }
    }

    public static String displayName(UsbDevice device) {
        String product = device.getProductName();
        if (product == null || product.isBlank()) {
            product = "USB " + String.format("%04X:%04X", device.getVendorId(), device.getProductId());
        }
        return product + " · " + device.getDeviceName();
    }
}
