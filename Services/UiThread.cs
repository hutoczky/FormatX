using System;
using System.Threading.Tasks;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using FormatX.Services;

namespace FormatX.Services
{
  // Centralized UI-thread marshaling helpers with audit logging
  public static class UiThread
  {
    public static Task RunOnUIThreadAsync(Action action)
      => RunOnUIThreadAsync(App.MainWindow as Window, action);

    public static Task RunOnUIThreadAsync(Func<Task> func)
      => RunOnUIThreadAsync(App.MainWindow as Window, func);

    public static Task<T> RunOnUIThreadAsync<T>(Func<T> func)
      => RunOnUIThreadAsync(App.MainWindow as Window, func);

    public static Task<T> RunOnUIThreadAsync<T>(Func<Task<T>> func)
      => RunOnUIThreadAsync(App.MainWindow as Window, func);

    // Overloads targeting a specific Window
    public static async Task RunOnUIThreadAsync(Window? win, Action action)
    {
      if (win == null) { try { await LogService.LogUsbWinrtErrorAsync("UiThread.Action", new InvalidOperationException("Dispatcher window unavailable")); } catch { } throw new InvalidOperationException("UI dispatcher is not available"); }
      if (win.DispatcherQueue.HasThreadAccess) { SafeInvoke(action, "UiThread.Action"); return; }
      var tcs = new TaskCompletionSource();
      win.DispatcherQueue.TryEnqueue(() => { SafeInvoke(action, "UiThread.Action"); tcs.TrySetResult(); });
      await tcs.Task.ConfigureAwait(false);
    }

    public static async Task RunOnUIThreadAsync(Window? win, Func<Task> func)
    {
      if (win == null) { try { await LogService.LogUsbWinrtErrorAsync("UiThread.FuncTask", new InvalidOperationException("Dispatcher window unavailable")); } catch { } throw new InvalidOperationException("UI dispatcher is not available"); }
      if (win.DispatcherQueue.HasThreadAccess) { await SafeInvokeAsync(func, "UiThread.FuncTask"); return; }
      var tcs = new TaskCompletionSource();
      win.DispatcherQueue.TryEnqueue(async () => { await SafeInvokeAsync(func, "UiThread.FuncTask"); tcs.TrySetResult(); });
      await tcs.Task.ConfigureAwait(false);
    }

    public static async Task<T> RunOnUIThreadAsync<T>(Window? win, Func<T> func)
    {
      if (win == null) { try { await LogService.LogUsbWinrtErrorAsync("UiThread.FuncT", new InvalidOperationException("Dispatcher window unavailable")); } catch { } throw new InvalidOperationException("UI dispatcher is not available"); }
      if (win.DispatcherQueue.HasThreadAccess) { return SafeInvoke(func, "UiThread.FuncT"); }
      var tcs = new TaskCompletionSource<T>();
      win.DispatcherQueue.TryEnqueue(() => { tcs.TrySetResult(SafeInvoke(func, "UiThread.FuncT")); });
      return await tcs.Task.ConfigureAwait(false);
    }

    public static async Task<T> RunOnUIThreadAsync<T>(Window? win, Func<Task<T>> func)
    {
      if (win == null) { try { await LogService.LogUsbWinrtErrorAsync("UiThread.FuncTaskT", new InvalidOperationException("Dispatcher window unavailable")); } catch { } throw new InvalidOperationException("UI dispatcher is not available"); }
      if (win.DispatcherQueue.HasThreadAccess) { return await SafeInvokeAsync(func, "UiThread.FuncTaskT"); }
      var tcs = new TaskCompletionSource<T>();
      win.DispatcherQueue.TryEnqueue(async () => { tcs.TrySetResult(await SafeInvokeAsync(func, "UiThread.FuncTaskT")); });
      return await tcs.Task.ConfigureAwait(false);
    }

    private static void SafeInvoke(Action action, string api)
    {
      try { action(); }
      catch (OperationCanceledException)
      {
        try { LogService.UsbRefreshCancelledAsync().GetAwaiter().GetResult(); } catch { }
        throw;
      }
      
      catch (Exception ex)
      {
        try { LogService.LogUsbWinrtErrorAsync(api, ex).GetAwaiter().GetResult(); } catch { }
        throw new InvalidOperationException($"UiThread.{api} failed", ex);
      }
    }
    private static T SafeInvoke<T>(Func<T> func, string api)
    {
      try { return func(); }
      catch (OperationCanceledException)
      {
        try { LogService.UsbRefreshCancelledAsync().GetAwaiter().GetResult(); } catch { }
        throw;
      }
      
      catch (Exception ex)
      {
        try { LogService.LogUsbWinrtErrorAsync(api, ex).GetAwaiter().GetResult(); } catch { }
        throw new InvalidOperationException($"UiThread.{api} failed", ex);
      }
    }
    private static async Task SafeInvokeAsync(Func<Task> func, string api)
    {
      try { await func(); }
      catch (OperationCanceledException)
      {
        try { await LogService.UsbRefreshCancelledAsync(); } catch { }
        throw;
      }
      
      catch (Exception ex)
      {
        try { await LogService.LogUsbWinrtErrorAsync(api, ex); } catch { }
        throw new InvalidOperationException($"UiThread.{api} failed", ex);
      }
    }
    private static async Task<T> SafeInvokeAsync<T>(Func<Task<T>> func, string api)
    {
      try { return await func(); }
      catch (OperationCanceledException)
      {
        try { await LogService.UsbRefreshCancelledAsync(); } catch { }
        throw;
      }
      
      catch (Exception ex)
      {
        try { await LogService.LogUsbWinrtErrorAsync(api, ex); } catch { }
        throw new InvalidOperationException($"UiThread.{api} failed", ex);
      }
    }
  }
}
