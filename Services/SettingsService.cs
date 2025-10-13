using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Windows.Storage;

namespace FormatX.Services
{
  public sealed class SettingsService
  {
    private static readonly Lazy<SettingsService> _lazy = new(() => new SettingsService());
    public static SettingsService Current => _lazy.Value;

    private readonly ApplicationDataContainer? _local;
    private readonly string _fallbackJsonPath;

    private SettingsService()
    {
      try { _local = ApplicationData.Current.LocalSettings; }
      catch { _local = null; }

      var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", ".settings");
      Directory.CreateDirectory(dir);
      _fallbackJsonPath = Path.Combine(dir, "settings.json");
      if (!File.Exists(_fallbackJsonPath)) File.WriteAllText(_fallbackJsonPath, "{}");
    }

    public T Get<T>(string key, T defaultValue = default!)
    {
      try
      {
        if (_local != null && _local.Values.ContainsKey(key))
        {
          var val = _local.Values[key];
          if (val is JsonElement je) return JsonSerializer.Deserialize<T>(je.GetRawText())!;
          if (val is T t) return t;
          if (val != null) return (T)Convert.ChangeType(val, typeof(T));
        }
      }
      catch {}
      try
      {
        var json = File.ReadAllText(_fallbackJsonPath);
        var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json) ?? new();
        if (dict.TryGetValue(key, out var obj))
        {
          var raw = JsonSerializer.Serialize(obj);
          return JsonSerializer.Deserialize<T>(raw)!;
        }
      }
      catch {}
      return defaultValue;
    }

    public void Set<T>(string key, T value)
    {
      try { if (_local != null) _local.Values[key] = value is null ? null : value; } catch {}
      try
      {
        var dict = new Dictionary<string, object>();
        if (File.Exists(_fallbackJsonPath))
        {
          using var fs = File.OpenRead(_fallbackJsonPath);
          dict = JsonSerializer.Deserialize<Dictionary<string, object>>(fs) ?? new();
        }
        dict[key] = value!;
        File.WriteAllText(_fallbackJsonPath, JsonSerializer.Serialize(dict, new JsonSerializerOptions{ WriteIndented = true }));
      }
      catch {}
    }

    public string Language
    {
      get => Get("Language", "hu-HU");
      set => Set("Language", value);
    }
    public string Theme
    {
      get => Get("Theme", "Dark");
      set => Set("Theme", value);
    }
    public string LastIsoPath
    {
      get => Get("LastIsoPath", string.Empty);
      set => Set("LastIsoPath", value);
    }
    public string LastDrive
    {
      get => Get("LastDrive", string.Empty);
      set => Set("LastDrive", value);
    }
    public string CustomBackgroundPath
    {
      get => Get("CustomBackgroundPath", string.Empty);
      set => Set("CustomBackgroundPath", value);
    }
  }
}