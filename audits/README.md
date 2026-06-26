# Audits

Store audit reports and evidence here.

Recommended folder format:

```text
audits/
  2026-06-27-example.com/
    report.md
    screenshots/
    lighthouse/
    network/
```

Do not commit sensitive customer data, private logs, credentials, or production secrets.

Create a new audit folder with:

```powershell
npm run audit:new -- https://example.com
```
