using System;
using System.Runtime.InteropServices;

namespace FormatX.Services
{
  internal static class AppEnv
  {
    // 15700 (0x3D54) = APPMODEL_ERROR_NO_PACKAGE
    private const int APPMODEL_ERROR_NO_PACKAGE = 15700;

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern int GetCurrentPackageFullName(ref int packageFullNameLength, IntPtr packageFullName);

    public static bool IsPackaged
    {
      get
      {
        try
        {
          int len = 0;
          int rc = GetCurrentPackageFullName(ref len, IntPtr.Zero);
          return rc != APPMODEL_ERROR_NO_PACKAGE;
        }
        catch { return false; }
      }
    }

    public static bool IsElevated => ElevationService.IsElevated();
  }
}
