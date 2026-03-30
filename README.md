# PPDC Backend

Professional Node.js backend scaffold using Express, PostgreSQL, and Swagger.

## Stack

- Node.js + npm
- Express REST API
- PostgreSQL (`pg`)
- Zod for validation
- Pino for structured logging
- OpenAPI/Swagger at `/api-docs`

## Project Structure

```text
src/
  app.js
  server.js
  config/
  core/
  db/
  docs/
  routes/
  features/
    auth/
    health/
    users/
```

## Quick Start

1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` and JWT secrets
3. Run:

```bash
npm install
npm run dev
```

Open Swagger UI at `http://localhost:4000/api-docs` to inspect and test the API.

## Scripts

- `npm run dev` - start development server (nodemon)
- `npm start` - start production server
- `npm run lint` - lint codebase
- `npm run lint:fix` - auto-fix lint issues
- `npm run format` - check formatting
- `npm run format:write` - apply formatting

## Next Implementation Targets

- Add migrations + seed strategy
- Implement auth service and repository
- Add users repository and PostgreSQL queries
- Add centralized request validation middleware
- Add tests (unit, integration, API)
