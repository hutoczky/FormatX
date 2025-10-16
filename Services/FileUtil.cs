using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace FormatX.Services
{
  internal static class FileUtil
  {
    public static async Task AppendAllTextRetryAsync(string path, string text, int attempts = 3, int delayMs = 300)
    {
      for (int i = 0; i < attempts; i++)
      {
        try { await File.AppendAllTextAsync(path, text, Encoding.UTF8); return; }
        catch when (i < attempts - 1) { await Task.Delay(delayMs); }
      }
    }

    public static async Task WriteAllTextRetryAsync(string path, string text, int attempts = 3, int delayMs = 300)
    {
      for (int i = 0; i < attempts; i++)
      {
        try { await File.WriteAllTextAsync(path, text, Encoding.UTF8); return; }
        catch when (i < attempts - 1) { await Task.Delay(delayMs); }
      }
    }
    
    public static async Task AtomicWriteAsync(string path, string content, int attempts = 3, int delayMs = 300)
    {
      var tmp = path + ".tmp";
      for (int i = 0; i < attempts; i++)
      {
        try
        {
          await File.WriteAllTextAsync(tmp, content, Encoding.UTF8);
          if (File.Exists(path)) File.Replace(tmp, path, null);
          else File.Move(tmp, path);
          return;
        }
        catch when (i < attempts - 1) { await Task.Delay(delayMs); }
      }
    }
  }
}
