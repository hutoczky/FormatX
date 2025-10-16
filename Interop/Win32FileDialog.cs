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
            [PreserveSig] int SetFileTypes(uint cFileTypes, [MarshalAs(UnmanagedType.LPArray)] COMDLG_FILTERSPEC[] rgFilterSpec);
            [PreserveSig] int SetFileTypeIndex(uint iFileType);
            [PreserveSig] int GetFileTypeIndex(out uint piFileType);
            [PreserveSig] int Advise(IntPtr pfde, out uint pdwCookie);
            [PreserveSig] int Unadvise(uint dwCookie);
            [PreserveSig] int SetOptions(uint fos);
            [PreserveSig] int GetOptions(out uint pfos);
            [PreserveSig] int SetDefaultFolder(IShellItem psi);
            [PreserveSig] int SetFolder(IShellItem psi);
            [PreserveSig] int GetFolder(out IShellItem ppsi);
            [PreserveSig] int GetCurrentSelection(out IShellItem ppsi);
            [PreserveSig] int SetFileName([MarshalAs(UnmanagedType.LPWStr)] string pszName);
            [PreserveSig] int GetFileName([MarshalAs(UnmanagedType.LPWStr)] out string pszName);
            [PreserveSig] int SetTitle([MarshalAs(UnmanagedType.LPWStr)] string pszTitle);
            [PreserveSig] int SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string pszText);
            [PreserveSig] int SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string pszLabel);
            [PreserveSig] int GetResult(out IShellItem ppsi);
            [PreserveSig] int AddPlace(IShellItem psi, uint fdap);
            [PreserveSig] int SetDefaultExtension([MarshalAs(UnmanagedType.LPWStr)] string pszDefaultExtension);
            [PreserveSig] int Close(int hr);
            [PreserveSig] int SetClientGuid(ref Guid guid);
            [PreserveSig] int ClearClientData();
            [PreserveSig] int SetFilter([MarshalAs(UnmanagedType.Interface)] object pFilter);
        }

        [ComImport]
        [Guid("d57c7288-d4ad-4768-be02-9d969532d960")]
        [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
        private interface IFileOpenDialog : IFileDialog
        {
            // IFileDialog (redeclare with PreserveSig to keep vtable aligned)
            new int Show(IntPtr hwndOwner);
            new int SetFileTypes(uint cFileTypes, COMDLG_FILTERSPEC[] rgFilterSpec);
            new int SetFileTypeIndex(uint iFileType);
            new int GetFileTypeIndex(out uint piFileType);
            new int Advise(IntPtr pfde, out uint pdwCookie);
            new int Unadvise(uint dwCookie);
            new int SetOptions(uint fos);
            new int GetOptions(out uint pfos);
            new int SetDefaultFolder(IShellItem psi);
            new int SetFolder(IShellItem psi);
            new int GetFolder(out IShellItem ppsi);
            new int GetCurrentSelection(out IShellItem ppsi);
            new int SetFileName(string pszName);
            new int GetFileName(out string pszName);
            new int SetTitle(string pszTitle);
            new int SetOkButtonLabel(string pszText);
            new int SetFileNameLabel(string pszLabel);
            new int GetResult(out IShellItem ppsi);
            new int AddPlace(IShellItem psi, uint fdap);
            new int SetDefaultExtension(string pszDefaultExtension);
            new int Close(int hr);
            new int SetClientGuid(ref Guid guid);
            new int ClearClientData();
            new int SetFilter(object pFilter);

            // IFileOpenDialog specific
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
      // IFileDialog (redeclare)
      new int Show(IntPtr hwndOwner);
      new int SetFileTypes(uint cFileTypes, COMDLG_FILTERSPEC[] rgFilterSpec);
      new int SetFileTypeIndex(uint iFileType);
      new int GetFileTypeIndex(out uint piFileType);
      new int Advise(IntPtr pfde, out uint pdwCookie);
      new int Unadvise(uint dwCookie);
      new int SetOptions(uint fos);
      new int GetOptions(out uint pfos);
      new int SetDefaultFolder(IShellItem psi);
      new int SetFolder(IShellItem psi);
      new int GetFolder(out IShellItem ppsi);
      new int GetCurrentSelection(out IShellItem ppsi);
      new int SetFileName(string pszName);
      new int GetFileName(out string pszName);
      new int SetTitle(string pszTitle);
      new int SetOkButtonLabel(string pszText);
      new int SetFileNameLabel(string pszLabel);
      new int GetResult(out IShellItem ppsi);
      new int AddPlace(IShellItem psi, uint fdap);
      new int SetDefaultExtension(string pszDefaultExtension);
      new int Close(int hr);
      new int SetClientGuid(ref Guid guid);
      new int ClearClientData();
      new int SetFilter(object pFilter);
      // Additional IFileSaveDialog methods not used
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

        private enum FDAP : uint
        {
            BOTTOM = 0x00000000,
            TOP = 0x00000001,
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
                ((IFileDialog)dlg).SetFileTypes((uint)specs.Length, specs);
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
                ((IFileDialog)dlg).SetFileTypes((uint)specs.Length, specs);
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
