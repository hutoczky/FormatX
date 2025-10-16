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
        private const int DefaultTimeoutSeconds = 20;

        public static async Task<T?> SafeExecuteAsync<T>(Func<CancellationToken, Task<T>> func, CancellationToken ct, Action<string> appendUsbLine, string area = "Guard")
        {
            try
            {
                using var cts = CreateTimeoutCts(ct);
                return await func(cts.Token).ConfigureAwait(false);
            }
            catch (TaskCanceledException tce)
            {
                TryLogCancelled(appendUsbLine, area, tce);
                return default;
            }
            catch (OperationCanceledException oce)
            {
                TryLogCancelled(appendUsbLine, area, oce);
                return default;
            }
            catch (COMException cex)
            {
                TryLogError(appendUsbLine, area, cex);
                return default;
            }
            catch (InvalidOperationException ioex)
            {
                TryLogError(appendUsbLine, area, ioex);
                return default;
            }
            catch (IOException ioex)
            {
                TryLogIoError(appendUsbLine, area, ioex);
                return default;
            }
            catch (Exception ex)
            {
                TryLogError(appendUsbLine, area, ex);
                return default;
            }
        }

        public static async Task SafeExecuteAsync(Func<CancellationToken, Task> func, CancellationToken ct, Action<string> appendUsbLine, string area = "Guard")
        {
            try
            {
                using var cts = CreateTimeoutCts(ct);
                await func(cts.Token).ConfigureAwait(false);
            }
            catch (TaskCanceledException tce)
            {
                TryLogCancelled(appendUsbLine, area, tce);
            }
            catch (OperationCanceledException oce)
            {
                TryLogCancelled(appendUsbLine, area, oce);
            }
            catch (COMException cex)
            {
                TryLogError(appendUsbLine, area, cex);
            }
            catch (InvalidOperationException ioex)
            {
                TryLogError(appendUsbLine, area, ioex);
            }
            catch (IOException ioex)
            {
                TryLogIoError(appendUsbLine, area, ioex);
            }
            catch (Exception ex)
            {
                TryLogError(appendUsbLine, area, ex);
            }
        }

        private static CancellationTokenSource CreateTimeoutCts(CancellationToken ct)
        {
            try
            {
                if (ct.CanBeCanceled) return CancellationTokenSource.CreateLinkedTokenSource(ct, new CancellationTokenSource(TimeSpan.FromSeconds(DefaultTimeoutSeconds)).Token);
                return new CancellationTokenSource(TimeSpan.FromSeconds(DefaultTimeoutSeconds));
            }
            catch { return new CancellationTokenSource(TimeSpan.FromSeconds(DefaultTimeoutSeconds)); }
        }

        private static void TryLogCancelled(Action<string> appendUsbLine, string area, Exception ex)
        {
            try { appendUsbLine($"usb.winrt.error:{area}:{ex.GetType().Name}:Cancelled:{Sanitize(ex.Message)}"); } catch { }
        }

        private static void TryLogError(Action<string> appendUsbLine, string area, Exception ex)
        {
            try { appendUsbLine($"usb.winrt.error:{area}:{ex.GetType().Name}:{Sanitize(ex.Message)}"); } catch { }
        }

        private static void TryLogIoError(Action<string> appendUsbLine, string area, IOException ex)
        {
            try { appendUsbLine($"usb.winrt.error:{area}:{ex.GetType().Name}:{Sanitize(ex.Message)}"); } catch { }
        }

        private static string Sanitize(string? s)
            => (s ?? string.Empty).Replace('\r', ' ').Replace('\n', ' ').Trim();
    }
}
