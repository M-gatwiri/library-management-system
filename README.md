# Library Management System API

A REST API for managing a library catalog, built with NestJS, Prisma, and
SQLite. It provides genre management, book search and pagination, and JWT
authentication. Book creation, updates, and deletion are restricted to
librarians.

## Features

- Full CRUD for genres and books
- Filter books by genre and search titles or authors
- Paginate book results
- Register and log in with bcrypt-hashed passwords and JWT access tokens
- Protect book write routes with librarian role authorization
- Validate request bodies and query parameters
- View the authenticated user's profile
- Importable Postman collection at [`docs/postman_collection.json`](docs/postman_collection.json)

## Requirements

- Node.js 20 or later
- npm

## Getting started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a local environment file from the example:

   ```sh
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env`.

3. Set a private, random `JWT_SECRET` in `.env`. Keep this secret out of
   version control. The example database URL uses a local SQLite database:

   ```dotenv
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="replace-with-a-long-random-secret"
   PORT=3000
   ```

4. Generate the Prisma client and create/update the database schema:

   ```sh
   npm run db:generate
   npm run db:push
   ```

5. Start the development server:

   ```sh
   npm run start:dev
   ```

The API is available at `http://localhost:3000`. The default SQLite database is
created at `prisma/dev.db`; local database files are ignored by Git.

## API reference

All endpoints are relative to the server URL. Request bodies use JSON.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register a member account |
| `POST` | `/auth/login` | Public | Log in and receive a JWT |
| `GET` | `/users/profile` | Authenticated | Get the current user's profile |
| `POST` | `/genres` | Public | Create a genre |
| `GET` | `/genres` | Public | List genres |
| `GET` | `/genres/:id` | Public | Get a genre |
| `PATCH` | `/genres/:id` | Public | Update a genre |
| `DELETE` | `/genres/:id` | Public | Delete a genre (only if it has no books) |
| `GET` | `/books` | Public | List, filter, search, and paginate books |
| `GET` | `/books/:id` | Public | Get a book |
| `POST` | `/books` | Librarian | Create a book |
| `PATCH` | `/books/:id` | Librarian | Update a book |
| `DELETE` | `/books/:id` | Librarian | Delete a book |

### Authentication

Register with an email and a password of 8-72 bytes:

```http
POST /auth/register
Content-Type: application/json

{
  "email": "reader@example.com",
  "password": "a-strong-password",
  "name": "Reader"
}
```

Registration returns an `accessToken`. Send it on authenticated requests using
the bearer authorization scheme:

```http
Authorization: Bearer <accessToken>
```

Passwords are hashed with bcrypt before storage. Public registration always
assigns the `MEMBER` role; it does not accept a role from the request. To grant
librarian access, an authorized operator must update the trusted user's `role`
to `LIBRARIAN` directly in the database. Do not expose role changes through a
public API.

### Book listing

`GET /books` accepts these optional query parameters:

| Parameter | Description | Default |
| --- | --- | --- |
| `genreId` | Filter by genre ID | Not set |
| `search` | Match a book title or author | Not set |
| `page` | 1-based page number | `1` |
| `limit` | Results per page (maximum `100`) | `10` |

For example:

```http
GET /books?genreId=2&search=history&page=1&limit=10
```

The response includes the matching `data`, `total` result count, `page`,
`limit`, and `totalPages`.

### Request validation

Book and genre create/update requests are validated. Book fields are `title`,
`author`, `isbn`, `totalCopies`, and `genreId`; genre fields are `name` and
optional `description`. Unknown request-body properties are stripped. Invalid
values and malformed query parameters return a `400 Bad Request`.

## Postman

Import [`docs/postman_collection.json`](docs/postman_collection.json) into
Postman. Set its `baseUrl` variable if the server is running on a different
address. Copy the `accessToken` returned by register or login into the
collection's `token` variable to try authenticated routes. Book write requests
require a librarian token.

## Development commands

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start NestJS in watch mode |
| `npm run build` | Compile the application |
| `npm run lint` | Lint source and tests |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Apply the Prisma schema to the database |

## Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma database connection URL |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs |
| `PORT` | No | HTTP port (defaults to `3000`) |
| `OBSERVE_APP_KEY` | No | NestJS Observe application key |
| `OBSERVE_APP_SECRET` | No | NestJS Observe application secret |
