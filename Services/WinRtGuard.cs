using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
    /// <summary>
    /// Central guard for WinRT/COM calls. Maps exceptions to usb.* log lines and never rethrows.
    /// </summary>
    public static class WinRtGuard
    {
        public static async Task<T?> SafeExecuteAsync<T>(Func<CancellationToken, Task<T>> func, CancellationToken ct, Action<string> appendUsbLine)
        {
            try
            {
                return await func(ct).ConfigureAwait(false);
            }
            catch (TaskCanceledException tce)
            {
                TryLogCancelled(appendUsbLine, tce);
                return default;
            }
            catch (OperationCanceledException oce)
            {
                TryLogCancelled(appendUsbLine, oce);
                return default;
            }
            catch (COMException cex)
            {
                TryLogError(appendUsbLine, cex);
                return default;
            }
            catch (InvalidOperationException ioex)
            {
                TryLogError(appendUsbLine, ioex);
                return default;
            }
            catch (IOException ioex)
            {
                TryLogIoError(appendUsbLine, ioex);
                return default;
            }
            catch (Exception ex)
            {
                TryLogError(appendUsbLine, ex);
                return default;
            }
        }

        public static async Task SafeExecuteAsync(Func<CancellationToken, Task> func, CancellationToken ct, Action<string> appendUsbLine)
        {
            try
            {
                await func(ct).ConfigureAwait(false);
            }
            catch (TaskCanceledException tce)
            {
                TryLogCancelled(appendUsbLine, tce);
            }
            catch (OperationCanceledException oce)
            {
                TryLogCancelled(appendUsbLine, oce);
            }
            catch (COMException cex)
            {
                TryLogError(appendUsbLine, cex);
            }
            catch (InvalidOperationException ioex)
            {
                TryLogError(appendUsbLine, ioex);
            }
            catch (IOException ioex)
            {
                TryLogIoError(appendUsbLine, ioex);
            }
            catch (Exception ex)
            {
                TryLogError(appendUsbLine, ex);
            }
        }

        private static void TryLogCancelled(Action<string> appendUsbLine, Exception ex)
        {
            try { appendUsbLine($"usb.refresh.cancelled: {Sanitize(ex.Message)}"); } catch { }
        }

        private static void TryLogError(Action<string> appendUsbLine, Exception ex)
        {
            try { appendUsbLine($"usb.winrt.error: {ex.GetType().Name} {Sanitize(ex.Message)}"); } catch { }
        }

        private static void TryLogIoError(Action<string> appendUsbLine, IOException ex)
        {
            try { appendUsbLine($"usb.io.error: {Sanitize(ex.Message)}"); } catch { }
        }

        private static string Sanitize(string? s)
            => (s ?? string.Empty).Replace('\r', ' ').Replace('\n', ' ').Trim();
    }
}
