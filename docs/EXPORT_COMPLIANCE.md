# iOS export compliance (encryption)

ReadTrail uses only standard HTTPS for optional Open Library requests and OS-provided TLS. It does not implement proprietary or non-exempt encryption.

`app.json` sets:

```json
"ITSAppUsesNonExemptEncryption": false
```

This answers App Store Connect’s encryption export questionnaire for apps that only use exempt encryption (HTTPS). Revisit this document if you add custom crypto, VPN, or end-to-end encryption features.
