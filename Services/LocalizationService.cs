using System;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using System.Resources;

namespace FormatX.Services
{
    public static class LocalizationService
    {
        private static readonly ResourceManager _resx = new("FormatX.Resources.Strings", Assembly.GetExecutingAssembly());
        private static readonly Dictionary<string, Dictionary<string, string>> _dict = new()
        {
            ["hu"] = new()
            {
                ["menu.format"] = "Formázás",
                ["menu.drives"] = "Lemezegységek",
                ["menu.erase"] = "Biztonságos törlés",
                ["menu.settings"] = "Beállítások",

                ["title.app"] = "FormatX Pro | Verzió: 2.0",
                ["title.format"] = "Formázás",
                ["title.drives"] = "Lemezegységek",
                ["title.erase"] = "Biztonságos törlés",
                ["title.settings"] = "Beállítások",

                ["status.ready"] = "Készenlét",
                ["common.apply"] = "Alkalmaz",
                ["common.validate"] = "Érvényesítés",
                ["common.browse"] = "Tallózás",
                ["common.checkUpdates"] = "Frissítések keresése",
                ["common.exportCsv"] = "Napló export (CSV)",

                ["settings.language"] = "Nyelv",
                ["settings.theme"] = "Téma",
                ["settings.theme.default"] = "Rendszer (Alapértelmezett)",
                ["settings.background"] = "Háttérkép (JPG/PNG/BMP)",
                ["settings.bg.hint"] = "Válassz beépített képet vagy saját fájlt.",
                ["settings.about"] = "Névjegy",
                ["settings.version"] = "Verzió: 2.0",
                ["settings.devline"] = "FormatTech © 2025 Hudacsek József (GamesTech)",

                ["iso.placeholder"] = "Válassz ISO-t",

                ["error.lang.unsupported"] = "A kiválasztott nyelv nem érhetõ el.",
                ["error.crash.title"] = "Váratlan hiba",
                ["error.crash.message"] = "A program hibát észlelt. A részletek naplózásra kerültek.",
                ["error.crash.export"] = "Jelentés exportálása",
                ["error.crash.close"] = "Bezárás",
                ["systemdrive.blocked"] = "A kijelölt meghajtó rendszermeghajtó (tiltva).",
                ["secureerase.systemdrive.warning"] = "Rendszermeghajtó nem törölhetõ biztonságosan.",
                ["dialog.confirm.title"] = "Megerõsítés",
                ["dialog.confirm.content"] = "Biztosan végrehajtja a mûveletet?",
                ["dialog.confirm.yes"] = "Igen",
                ["dialog.confirm.no"] = "Mégse",
                ["partitions.apply.done"] = "Partíciós terv alkalmazva",
                ["partitions.rollback.applied"] = "Visszaállítás végrehajtva",
                ["partitions.rollback.none"] = "Nincs rollback mentés",
                ["iso.write.prepared"] = "ISO ? USB elõkészítve",
                ["operation.format.done"] = "Formázás kész",
                ["operation.erase.done"] = "Törlés kész",
                ["eta.prefix"] = "ETA:",
                ["crash.dialog.openFolder"] = "Log megnyitása",
                ["background.set.success"] = "Háttér beállítva",
                ["background.set.cancel"] = "Háttér visszavonva",
                ["background.set.error"] = "Háttér beállítása sikertelen",
            },
            ["en"] = new()
            {
                ["iso.placeholder"] = "Select ISO",
                ["error.background.unsupportedext"] = "Unsupported background image extension",
                ["error.iso.filemissing"] = "Missing ISO file",
                ["error.iso.invalidext"] = "Invalid ISO extension",
                ["error.background.validate"] = "Background validation error",
                ["menu.format"] = "Format",
                ["menu.drives"] = "Drives",
                ["menu.erase"] = "Secure Erase",
                ["menu.settings"] = "Settings",

                ["title.app"] = "FormatX Pro | Version: 2.0",
                ["title.format"] = "Format",
                ["title.drives"] = "Drives",
                ["title.erase"] = "Secure Erase",
                ["title.settings"] = "Settings",

                ["status.ready"] = "Idle",
                ["common.apply"] = "Apply",
                ["common.validate"] = "Validate",
                ["common.browse"] = "Browse",
                ["common.checkUpdates"] = "Check for updates",
                ["common.exportCsv"] = "Export log (CSV)",

                ["settings.language"] = "Language",
                ["settings.theme"] = "Theme",
                ["settings.theme.default"] = "System (Default)",
                ["settings.background"] = "Background (JPG/PNG/BMP)",
                ["settings.bg.hint"] = "Choose a built-in image or your own file.",
                ["settings.about"] = "About",
                ["settings.version"] = "Version: 2.0",
                ["settings.devline"] = "FormatTech © 2025 Hudacsek József (GamesTech)",

                ["error.lang.unsupported"] = "The selected language is not available.",
                ["error.crash.title"] = "Unexpected error",
                ["error.crash.message"] = "The application encountered an error. Details were logged.",
                ["error.crash.export"] = "Export report",
                ["error.crash.close"] = "Close",
                ["background.set.success"] = "Background set",
                ["background.set.cancel"] = "Background canceled",
                ["background.set.error"] = "Failed to set background",
                ["background.pick.open"] = "Background picker opened",
                ["background.restore.done"] = "Background restored",
                ["error.background.filemissing"] = "Missing background file",
                ["error.background.emptyfile"] = "Empty file",
                ["error.iso.invalidext"] = "Invalid ISO extension",
                ["error.iso.picker"] = "ISO picker error",
                ["common.browse"] = "Browse...",
                ["systemdrive.blocked"] = "Selected drive is a system drive (disabled).",
                ["secureerase.systemdrive.warning"] = "System drive cannot be securely erased.",
                ["dialog.confirm.title"] = "Confirmation",
                ["dialog.confirm.yes"] = "Yes",
                ["dialog.confirm.no"] = "Cancel",
                ["partitions.apply.done"] = "Partition plan applied",
                ["partitions.rollback.applied"] = "Rollback applied",
                ["partitions.rollback.none"] = "No rollback snapshot",
                ["dialog.confirm.content"] = "Are you sure you want to proceed?",
                ["iso.write.prepared"] = "ISO ? USB prepared",
                ["operation.format.done"] = "Format done",
                ["operation.erase.done"] = "Erase done",
                ["eta.prefix"] = "ETA:",
                ["crash.dialog.openFolder"] = "Open log folder",
                ["crash.dialog.title"] = "An error occurred",
            }
        };

        public static string CurrentLanguage { get; private set; } = "hu";

        public static bool SetLanguage(string lang)
        {
            if (string.IsNullOrWhiteSpace(lang)) return false;
            lang = lang.ToLowerInvariant();
            if (_dict.ContainsKey(lang)) { CurrentLanguage = lang; return true; }
            return false;
        }

        public static string T(string key)
        {
            if (string.IsNullOrWhiteSpace(key)) return key;
            try
            {
                var ci = new CultureInfo(CurrentLanguage == "en" ? "en-US" : "hu-HU");
                var s = _resx.GetString(key, ci);
                if (!string.IsNullOrEmpty(s)) return s!;
            }
            catch { }

            var lang = CurrentLanguage;
            if (_dict.TryGetValue(lang, out var map) && map.TryGetValue(key, out var val)) return val;
            if (_dict.TryGetValue("hu", out var hun) && hun.TryGetValue(key, out var def)) return def;
            return key;
        }
    }
}
