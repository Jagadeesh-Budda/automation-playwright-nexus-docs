# ASA Certification Backend (docs/backend-server)

This minimal backend provides services used by the ASA learning portal documentation/demo.

Quick start

1. Install dependencies:

```bash
cd ui-automation/docs/backend-server
npm install
```

2. Run the server locally:

```bash
npm run dev
```

Notes about databases
- This project currently lists both `prisma` and `mongoose` as dependencies. That indicates two possible persistence strategies:
  - `Prisma` is commonly used with SQL databases (Postgres, MySQL, SQLite).
  - `Mongoose` is an ODM for MongoDB.

Before running in production, choose one strategy and ensure the code and environment match that choice. If you intend to use Prisma, provide the appropriate `DATABASE_URL` and run `npx prisma migrate deploy` as needed. If you prefer MongoDB, ensure `MONGODB_URI` is set and any Prisma references are removed or isolated.

Environment variables
- `PORT` — port to run the backend (default 3000)
- `DATABASE_URL` — for Prisma-backed DBs
- `MONGODB_URI` — for MongoDB (if using Mongoose)

QA
- Run the simple QA AST tests from the docs root to validate `astService` behavior:

```bash
cd ui-automation/docs
node qa_ast_tests.js
```

If you'd like, I can help consolidate the DB approach and update the server code accordingly.
