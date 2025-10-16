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
                ["menu.format"] = "Form�z�s",
                ["menu.drives"] = "Lemezegys�gek",
                ["menu.erase"] = "Biztons�gos t�rl�s",
                ["menu.settings"] = "Be�ll�t�sok",

                ["title.app"] = "FormatX Pro | Verzi�: 2.0",
                ["title.format"] = "Form�z�s",
                ["title.drives"] = "Lemezegys�gek",
                ["title.erase"] = "Biztons�gos t�rl�s",
                ["title.settings"] = "Be�ll�t�sok",

                ["status.ready"] = "K�szenl�t",
                ["common.apply"] = "Alkalmaz",
                ["common.validate"] = "�rv�nyes�t�s",
                ["common.browse"] = "Tall�z�s",
                ["common.checkUpdates"] = "Friss�t�sek keres�se",
                ["common.exportCsv"] = "Napl� export (CSV)",

                ["settings.language"] = "Nyelv",
                ["settings.theme"] = "T�ma",
                ["settings.theme.default"] = "Rendszer (Alap�rtelmezett)",
                ["settings.background"] = "H�tt�rk�p (JPG/PNG/BMP)",
                ["settings.bg.hint"] = "V�lassz be�p�tett k�pet vagy saj�t f�jlt.",
                ["settings.about"] = "N�vjegy",
                ["settings.version"] = "Verzi�: 2.0",
                ["settings.devline"] = "FormatTech � 2025 Hudacsek J�zsef (GamesTech)",

                ["iso.placeholder"] = "V�lassz ISO-t",

                ["error.lang.unsupported"] = "A kiv�lasztott nyelv nem �rhet� el.",
                ["error.crash.title"] = "V�ratlan hiba",
                ["error.crash.message"] = "A program hib�t �szlelt. A r�szletek napl�z�sra ker�ltek.",
                ["error.crash.export"] = "Jelent�s export�l�sa",
                ["error.crash.close"] = "Bez�r�s",
                ["systemdrive.blocked"] = "A kijel�lt meghajt� rendszermeghajt� (tiltva).",
                ["secureerase.systemdrive.warning"] = "Rendszermeghajt� nem t�r�lhet� biztons�gosan.",
                ["dialog.confirm.title"] = "Meger�s�t�s",
                ["dialog.confirm.content"] = "Biztosan v�grehajtja a m�veletet?",
                ["dialog.confirm.yes"] = "Igen",
                ["dialog.confirm.no"] = "M�gse",
                ["partitions.apply.done"] = "Part�ci�s terv alkalmazva",
                ["partitions.rollback.applied"] = "Vissza�ll�t�s v�grehajtva",
                ["partitions.rollback.none"] = "Nincs rollback ment�s",
                ["iso.write.prepared"] = "ISO ? USB el�k�sz�tve",
                ["operation.format.done"] = "Form�z�s k�sz",
                ["operation.erase.done"] = "T�rl�s k�sz",
                ["eta.prefix"] = "ETA:",
                ["crash.dialog.openFolder"] = "Log megnyit�sa",
                ["background.set.success"] = "H�tt�r be�ll�tva",
                ["background.set.cancel"] = "H�tt�r visszavonva",
                ["background.set.error"] = "H�tt�r be�ll�t�sa sikertelen",
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
                ["settings.devline"] = "FormatTech � 2025 Hudacsek J�zsef (GamesTech)",

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
