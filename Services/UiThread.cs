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
      var dq = TryGetDispatcher(win, "UiThread.Action");
      if (dq == null) { /* no-op in teardown/headless */ return; }
      bool has = false; try { has = dq.HasThreadAccess; } catch { has = false; }
      if (has) { SafeInvoke(action, "UiThread.Action"); return; }
      var tcs = new TaskCompletionSource();
      if (!dq.TryEnqueue(() => { SafeInvoke(action, "UiThread.Action"); tcs.TrySetResult(); })) tcs.TrySetResult();
      await tcs.Task.ConfigureAwait(false);
    }

    public static async Task RunOnUIThreadAsync(Window? win, Func<Task> func)
    {
      var dq = TryGetDispatcher(win, "UiThread.FuncTask");
      if (dq == null) { /* no-op in teardown/headless */ return; }
      bool has = false; try { has = dq.HasThreadAccess; } catch { has = false; }
      if (has) { await SafeInvokeAsync(func, "UiThread.FuncTask"); return; }
      var tcs = new TaskCompletionSource();
      if (!dq.TryEnqueue(async () => { await SafeInvokeAsync(func, "UiThread.FuncTask"); tcs.TrySetResult(); })) tcs.TrySetResult();
      await tcs.Task.ConfigureAwait(false);
    }

    public static async Task<T> RunOnUIThreadAsync<T>(Window? win, Func<T> func)
    {
      var dq = TryGetDispatcher(win, "UiThread.FuncT");
      if (dq == null) { return default!; }
      bool has = false; try { has = dq.HasThreadAccess; } catch { has = false; }
      if (has) { return SafeInvoke(func, "UiThread.FuncT"); }
      var tcs = new TaskCompletionSource<T>();
      if (!dq.TryEnqueue(() => { tcs.TrySetResult(SafeInvoke(func, "UiThread.FuncT")); })) return default!;
      return await tcs.Task.ConfigureAwait(false);
    }

    public static async Task<T> RunOnUIThreadAsync<T>(Window? win, Func<Task<T>> func)
    {
      var dq = TryGetDispatcher(win, "UiThread.FuncTaskT");
      if (dq == null) { return default!; }
      bool has = false; try { has = dq.HasThreadAccess; } catch { has = false; }
      if (has) { return await SafeInvokeAsync(func, "UiThread.FuncTaskT"); }
      var tcs = new TaskCompletionSource<T>();
      if (!dq.TryEnqueue(async () => { tcs.TrySetResult(await SafeInvokeAsync(func, "UiThread.FuncTaskT")); })) return default!;
      return await tcs.Task.ConfigureAwait(false);
    }

    private static Microsoft.UI.Dispatching.DispatcherQueue? TryGetDispatcher(Window? win, string api)
    {
      if (win == null)
      {
        try { LogService.LogUsbAppErrorAsync(api, new InvalidOperationException("Dispatcher window unavailable")).GetAwaiter().GetResult(); } catch { }
        return null;
      }
      try { return win.DispatcherQueue; }
      catch (Exception ex)
      {
        try { LogService.LogUsbAppErrorAsync("UI.DispatcherQueueNull", ex).GetAwaiter().GetResult(); } catch { }
        return null;
      }
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
