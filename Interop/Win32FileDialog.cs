using System;
using System.Runtime.InteropServices;

namespace FormatX.Interop
{
    internal static class Win32FileDialog
    {
        [ComImport]
        [Guid("DC1C5A9C-E88A-4DDE-A5A1-60F82A20AEF7")]
        private class FileOpenDialogCom { }

        [ComImport]
        [Guid("42f85136-db7e-439c-85f1-e4075d135fc8")]
        [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
        private interface IFileDialog
        {
            [PreserveSig] int Show(IntPtr hwndOwner);
            void SetFileTypes(uint cFileTypes, [MarshalAs(UnmanagedType.LPArray)] COMDLG_FILTERSPEC[] rgFilterSpec);
            void SetFileTypeIndex(uint iFileType);
            void GetFileTypeIndex(out uint piFileType);
            void Advise();
            void Unadvise();
            void SetOptions(uint fos);
            void GetOptions(out uint pfos);
            void SetDefaultFolder(IShellItem psi);
            void SetFolder(IShellItem psi);
            void GetFolder(out IShellItem ppsi);
            void GetCurrentSelection(out IShellItem ppsi);
            void SetFileName([MarshalAs(UnmanagedType.LPWStr)] string pszName);
            void GetFileName([MarshalAs(UnmanagedType.LPWStr)] out string pszName);
            void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string pszTitle);
            void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string pszText);
            void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string pszLabel);
            void GetResult(out IShellItem ppsi);
            void AddPlace(IShellItem psi, uint fdap);
            void SetDefaultExtension([MarshalAs(UnmanagedType.LPWStr)] string pszDefaultExtension);
            void Close(int hr);
            void SetClientGuid();
            void ClearClientData();
            void SetFilter([MarshalAs(UnmanagedType.Interface)] object pFilter);
        }

        [ComImport]
        [Guid("d57c7288-d4ad-4768-be02-9d969532d960")]
        [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
        private interface IFileOpenDialog : IFileDialog
        {
            // IFileDialog
            new int Show(IntPtr hwndOwner);
            new void SetFileTypes(uint cFileTypes, COMDLG_FILTERSPEC[] rgFilterSpec);
            new void SetFileTypeIndex(uint iFileType);
            new void GetFileTypeIndex(out uint piFileType);
            new void Advise();
            new void Unadvise();
            new void SetOptions(uint fos);
            new void GetOptions(out uint pfos);
            new void SetDefaultFolder(IShellItem psi);
            new void SetFolder(IShellItem psi);
            new void GetFolder(out IShellItem ppsi);
            new void GetCurrentSelection(out IShellItem ppsi);
            new void SetFileName(string pszName);
            new void GetFileName(out string pszName);
            new void SetTitle(string pszTitle);
            new void SetOkButtonLabel(string pszText);
            new void SetFileNameLabel(string pszLabel);
            new void GetResult(out IShellItem ppsi);
            new void AddPlace(IShellItem psi, uint fdap);
            new void SetDefaultExtension(string pszDefaultExtension);
            new void Close(int hr);
            new void SetClientGuid();
            new void ClearClientData();
            new void SetFilter(object pFilter);

            // IFileOpenDialog
            void GetResults();
            void GetSelectedItems();
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct COMDLG_FILTERSPEC
        {
            public string pszName;
            public string pszSpec;
            public COMDLG_FILTERSPEC(string name, string spec) { pszName = name; pszSpec = spec; }
        }

    [Flags]
    private enum FOS : uint
    {
      OVERWRITEPROMPT = 0x00000002,
      STRICTFILETYPES = 0x00000004,
      NOCHANGEDIR = 0x00000008,
      PICKFOLDERS = 0x00000020,
      FORCEFILESYSTEM = 0x00000040,
      NODEREFERENCELINKS = 0x00100000,
      DONTADDTORECENT = 0x02000000,
      PATHMUSTEXIST = 0x00000800,
      FILEMUSTEXIST = 0x00001000,
    }

    [ComImport]
    [Guid("84BCCD23-5FDE-4CDB-AEA4-AF64B83D78AB")]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IFileSaveDialog : IFileDialog
    {
      // IFileDialog
      new int Show(IntPtr hwndOwner);
      new void SetFileTypes(uint cFileTypes, COMDLG_FILTERSPEC[] rgFilterSpec);
      new void SetFileTypeIndex(uint iFileType);
      new void GetFileTypeIndex(out uint piFileType);
      new void Advise();
      new void Unadvise();
      new void SetOptions(uint fos);
      new void GetOptions(out uint pfos);
      new void SetDefaultFolder(IShellItem psi);
      new void SetFolder(IShellItem psi);
      new void GetFolder(out IShellItem ppsi);
      new void GetCurrentSelection(out IShellItem ppsi);
      new void SetFileName(string pszName);
      new void GetFileName(out string pszName);
      new void SetTitle(string pszTitle);
      new void SetOkButtonLabel(string pszText);
      new void SetFileNameLabel(string pszLabel);
      new void GetResult(out IShellItem ppsi);
      new void AddPlace(IShellItem psi, uint fdap);
      new void SetDefaultExtension(string pszDefaultExtension);
      new void Close(int hr);
      new void SetClientGuid();
      new void ClearClientData();
      new void SetFilter(object pFilter);
      // IFileSaveDialog specific methods not used
    }

    [ComImport]
    [Guid("C0B4E2F3-BA21-4773-8DBA-335EC946EB8B")]
    private class FileSaveDialogCom { }

        [ComImport]
        [Guid("43826d1e-e718-42ee-bc55-a1e261c37bfe")]
        [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
        private interface IShellItem
        {
            void BindToHandler();
            void GetParent();
            void GetDisplayName(SIGDN sigdnName, out IntPtr ppszName);
            void GetAttributes();
            void Compare();
        }

        private enum SIGDN : uint
        {
            FILESYSPATH = 0x80058000
        }

        [DllImport("ole32.dll")]
        private static extern void CoTaskMemFree(IntPtr pv);

        public static string? ShowOpenFileDialog(IntPtr hwndOwner, (string name, string spec)[] filters, string? defaultExt = null)
        {
            IFileOpenDialog dlg = (IFileOpenDialog)new FileOpenDialogCom();
            try
            {
                var specs = new COMDLG_FILTERSPEC[filters.Length];
                for (int i = 0; i < filters.Length; i++) specs[i] = new COMDLG_FILTERSPEC(filters[i].name, filters[i].spec);
                dlg.SetFileTypes((uint)specs.Length, specs);
                // Prefer filesystem paths and avoid recent list; enforce exist
                ((IFileDialog)dlg).SetOptions((uint)(FOS.FORCEFILESYSTEM | FOS.FILEMUSTEXIST | FOS.PATHMUSTEXIST | FOS.DONTADDTORECENT));
                if (!string.IsNullOrWhiteSpace(defaultExt)) dlg.SetDefaultExtension(defaultExt!);
                int hr = dlg.Show(hwndOwner);
                if (hr != 0) return null; // canceled or failed
                dlg.GetResult(out var item);
                item.GetDisplayName(SIGDN.FILESYSPATH, out var pStr);
                var path = Marshal.PtrToStringUni(pStr);
                if (pStr != IntPtr.Zero) CoTaskMemFree(pStr);
                return path;
            }
            catch
            {
                return null;
            }
            finally
            {
                try { if (dlg is not null) Marshal.ReleaseComObject(dlg); } catch { }
            }
        }

        public static string? ShowSaveFileDialog(IntPtr hwndOwner, (string name, string spec)[] filters, string? defaultExt = null, string? suggestedFileName = null)
        {
            IFileSaveDialog dlg = (IFileSaveDialog)new FileSaveDialogCom();
            try
            {
                var specs = new COMDLG_FILTERSPEC[filters.Length];
                for (int i = 0; i < filters.Length; i++) specs[i] = new COMDLG_FILTERSPEC(filters[i].name, filters[i].spec);
                dlg.SetFileTypes((uint)specs.Length, specs);
                ((IFileDialog)dlg).SetOptions((uint)(FOS.FORCEFILESYSTEM | FOS.OVERWRITEPROMPT | FOS.PATHMUSTEXIST | FOS.DONTADDTORECENT));
                if (!string.IsNullOrWhiteSpace(defaultExt)) dlg.SetDefaultExtension(defaultExt!);
                if (!string.IsNullOrWhiteSpace(suggestedFileName)) ((IFileDialog)dlg).SetFileName(suggestedFileName!);
                int hr = dlg.Show(hwndOwner);
                if (hr != 0) return null;
                ((IFileDialog)dlg).GetResult(out var item);
                item.GetDisplayName(SIGDN.FILESYSPATH, out var pStr);
                var path = Marshal.PtrToStringUni(pStr);
                if (pStr != IntPtr.Zero) CoTaskMemFree(pStr);
                return path;
            }
            catch { return null; }
            finally { try { if (dlg is not null) Marshal.ReleaseComObject(dlg); } catch { } }
        }

        public static string? ShowPickFolderDialog(IntPtr hwndOwner)
        {
            IFileOpenDialog dlg = (IFileOpenDialog)new FileOpenDialogCom();
            try
            {
                ((IFileDialog)dlg).SetOptions((uint)(FOS.PICKFOLDERS | FOS.FORCEFILESYSTEM | FOS.PATHMUSTEXIST | FOS.DONTADDTORECENT));
                int hr = dlg.Show(hwndOwner);
                if (hr != 0) return null;
                ((IFileDialog)dlg).GetResult(out var item);
                item.GetDisplayName(SIGDN.FILESYSPATH, out var pStr);
                var path = Marshal.PtrToStringUni(pStr);
                if (pStr != IntPtr.Zero) CoTaskMemFree(pStr);
                return path;
            }
            catch { return null; }
            finally { try { if (dlg is not null) Marshal.ReleaseComObject(dlg); } catch { } }
        }
    }
}
