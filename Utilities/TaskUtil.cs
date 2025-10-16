using System;
using System.Threading.Tasks;
using FormatX.Services;

namespace FormatX.Utilities
{
  public static class TaskUtil
  {
    public static void SafeFireAndForget(Task task, string tag)
    {
      if (task == null) return;
      task.ContinueWith(t =>
      {
        try
        {
          var ex = t.Exception?.GetBaseException();
          if (ex is OperationCanceledException) return; // benign
          _ = LogService.LogAsync("task.error", new { tag, type = ex?.GetType().FullName, ex = ex?.Message });
        }
        catch { }
      }, TaskContinuationOptions.OnlyOnFaulted | TaskContinuationOptions.ExecuteSynchronously);
    }
  }
}
