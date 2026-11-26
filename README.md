# contextatk

Keep your context as name/value notes and hand it to any AI model through a private read-only link. Open source, built on Cloudflare Workers + D1. Beta.

- `api/`: the API worker (D1 database, rate limiting).
- `www/`: the website and dashboard worker.

Each folder has its own README with setup notes. Only source files are published here; set your own D1 database id and secrets (see each `.dev.vars.example`).
