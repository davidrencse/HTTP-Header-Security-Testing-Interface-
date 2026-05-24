# HeaderRift Backend

Node.js, Express, and TypeScript REST API for HeaderRift.

## Development

```bash
npm install
npm run dev
```

Build and run:

```bash
npm run build
npm start
```

The API is served under `/api`; health is available at `/api/health`.

## Persistence

The project plan references Prisma-backed persistence. For this compact MVP backend, data is persisted in `backend/data/store.json` using file-backed JSON storage so user-created targets, chains, runs, and exports survive restarts. The storage layer is isolated and can be replaced by Prisma later without changing route contracts.

## Safety controls

Runs require saved target profiles, authorization acknowledgement, path and method scope checks, bounded rate limits, DNS/IP validation, and explicit public-range override acknowledgement when a target resolves to a public IP. Managed transport headers such as `Host`, `Content-Length`, `Connection`, `Transfer-Encoding`, and `Upgrade` are not sent from user-authored header inputs.
