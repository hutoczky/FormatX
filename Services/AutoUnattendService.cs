using System.IO;
using System.Threading.Tasks;

namespace FormatX.Services
{
  /// <summary>
  /// Generates and writes an autounattend.xml file to a USB drive to bypass Windows 11 hardware requirements.
  /// </summary>
  public sealed class AutoUnattendService
  {
    /// <summary>
    /// Writes an AutoUnattend file to the specified drive.  This file configures Windows Setup
    /// to bypass TPM, SecureBoot and other hardware checks during installation.  It should be
    /// called after the Windows ISO has been copied to the target USB drive.
    /// </summary>
    /// <param name="driveLetter">Drive letter of the USB device (without trailing colon).</param>
    public async Task WriteAutoUnattendAsync(string driveLetter)
    {
      // Construct an autounattend.xml file that sets registry keys under HKLM\SYSTEM\Setup\LabConfig
      // to bypass various hardware requirements.  See the Windows Setup documentation for details.
      var xml = @"<?xml version=""1.0"" encoding=""utf-8""?>
<unattend xmlns=""urn:schemas-microsoft-com:unattend"">
  <settings pass=""specialize"">
    <component name=""Microsoft-Windows-Setup"" processorArchitecture=""amd64"" publicKeyToken=""31bf3856ad364e35"" language=""neutral"" versionScope=""nonSxS"" xmlns:wcm=""http://schemas.microsoft.com/WMIConfig/2002/State"" xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"">
      <RunSynchronous>
        <RunSynchronousCommand wcm:action=""add"">
          <Order>1</Order>
          <Description>Bypass Windows 11 hardware requirements</Description>
          <Path>cmd.exe /c reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassTPMCheck /t REG_DWORD /d 1 /f &amp;&amp; reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassSecureBootCheck /t REG_DWORD /d 1 /f &amp;&amp; reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassRAMCheck /t REG_DWORD /d 1 /f &amp;&amp; reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassStorageCheck /t REG_DWORD /d 1 /f &amp;&amp; reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassCPUCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
      </RunSynchronous>
    </component>
  </settings>
</unattend>";
      // Write the file as autounattend.xml. Windows Setup reads this file automatically when it is at the root of the USB drive.
      var path = Path.Combine(driveLetter + ":", "autounattend.xml");
      await File.WriteAllTextAsync(path, xml);
    }
  }
}