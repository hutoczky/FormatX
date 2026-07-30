# FormatX Suite Pro V92 — Release notes

**Kiadási dátum / Release date:** 2026-07-30  
**Összesített állapot / Overall status:** **Public beta / Nyilvános béta**

A V92 nyilvánosan tesztelhető kiadás. Jelenleg egyik platform sem kap **Stable** címkét.

## Platformstratégia / Platform strategy

- **Linux / Bazzite:** elsődleges cél- és támogatási platform / primary target and support platform.
- **Windows:** másodlagosan támogatott platform / secondary supported platform.

A támogatási szerep nem azonos a fejlettségi állapottal: a Linux/Bazzite a fő projektirány, miközben a natív kiadás még Development állapotú; a Windows jelenleg Public beta állapotú, de hosszú távon másodlagos támogatási szerepet tölt be.

## Egységes platformállapot / Unified platform status

| Platform | Support role | Status | Version / direction | Public meaning |
|---|---|---|---|---|
| Linux / Bazzite | **Primary platform** | **Development** | Native target | Main FormatX target and support platform; native edition under active development. |
| Windows | **Secondary supported** | **Public beta** | V92 | Publicly testable Windows-specific desktop build; not a final stable release. |
| macOS | Roadmap | **Planned** | Roadmap | No public native package yet. |
| Web | Supplementary preview | **Technical preview** | Browser experience | Organism UI, simulator and licensing preview; no native drive operations. |
| Android | Supplementary preview | **Public beta** | 1.0.4–1.0.6 | Direct-install APK for public testing; not a final Play Store release. |
| iOS / iPadOS | Roadmap | **Planned** | Roadmap | No downloadable or testable package yet. |

Canonical machine-readable source: `docs/scifi-ui/data/platform-status.json`.

## Product and licence state

- 5-day trial licence for the released application.
- Paid access is activated only after manual verification of the bank credit, amount, currency and order reference.
- No automatic renewal or recurring card charge.
- The web interface is a technical preview and does not imply native platform feature parity.

## V92 focus

- Public Windows prototype with Windows-specific WinUI 3 and disk-management components.
- Linux/Bazzite-first product direction and native-platform development.
- Unified web product-status communication.
- Local, switchable Organism thought and voice interface.
- QR-assisted bank-transfer workflow with local fallback QR assets.
- Local detailed licence page and unified HU/EN controls.

## Verification evidence

Before promoting any platform to **Stable**, the release must publish:

1. signed release artefact or verifiable signing proof;
2. SHA-256 checksum for every downloadable package;
3. public test matrix with OS, version, hardware, function, result and known limitation;
4. changelog and known-issues list;
5. reproducible audit or validation report;
6. defined support response targets.

## Known limitations

- Linux/Bazzite is the primary platform direction, but its native tooling is still in development.
- Windows V92 is the secondary supported platform and remains a public beta.
- macOS and iOS/iPadOS packages are not available.
- Android is distributed as a public-beta direct-install package.
- The Web build is a technical preview, not a replacement for native drive-management operations.

## Support

- Website: https://www.formatxsuite.com/scifi-ui/support.html
- E-mail: hutoczky@gmail.com
- Public issues: https://github.com/hutoczky/FormatX/issues
