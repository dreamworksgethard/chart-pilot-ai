# Chart Pilot AI

Futures autopilot site for **Chart Pilot AI** (`$CPAI`).

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushes to `main` deploy automatically to GitHub Pages.

**Live domain:** [https://chartpilotai.xyz](https://chartpilotai.xyz)

### DNS (registrar)

Point `chartpilotai.xyz` at GitHub Pages:

| Type | Name | Value |
|------|------|--------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `dreamworksgethard.github.io` |

After DNS propagates, enable HTTPS in the repo **Settings → Pages**.
