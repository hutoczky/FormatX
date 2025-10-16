# FormatX Privacy Policy (Draft)

Last updated: 2025-01-01

This document describes how FormatX handles data locally and over the network.

- Logs: The app writes diagnostic and operation logs to `%LOCALAPPDATA%/FormatX/logs`. Logs are stored locally and can be exported by the user. Retention is user?controlled; the app does not upload logs.
- Telemetry: Optional. Users can opt out in Settings. When enabled, only minimal usage/health signals are sent (no PII). Telemetry endpoints are listed in the source repository and can be disabled.
- Network calls: The app may check for updates (GitHub Releases) and download installers when the user requests. No credentials are transmitted.
- Storage access: The app can access files chosen by the user via file pickers and, if allowed, removable storage for ISO?USB functions.
- Sensitive operations: Destructive actions require explicit user confirmation and administrative rights. The Store package does not elevate. Demo/dry?run modes are provided for testing.
- Security: We do not collect credentials. All network calls use HTTPS.
- Changes: We may update this policy; material changes will be published with a new version.
- Contact: Open an issue on the GitHub repository.
