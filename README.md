# Rentals Hub N.V. - Backend MVP

Welcome to the backend repository for **Rentals Hub N.V.**, a multi-service booking marketplace supporting Stays, Cars, Food, Salon, Barber, and Spa bookings.

This project uses a clean architecture pattern (Controller-Service-Repository) and is built to be highly scalable.

## Tech Stack

- **Framework**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma (v7+)
- **Validation**: Zod
- **Documentation**: Swagger OpenAPI
- **Authentication**: JWT & Role-Based Access Control (RBAC)

## Prerequisites

Before running this project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or remotely)
- `npm` or `yarn`

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy the example environment file and update it with your own credentials (especially the `DATABASE_URL`):
   ```bash
   cp .env.example .env
   ```
   *Make sure your PostgreSQL server is running and the database specified in `DATABASE_URL` exists.*

## Database & Prisma Setup

This project uses Prisma v7+. Note that connection configurations for migrating are handled via `prisma.config.ts`.

1. **Run Database Migrations**:
   To sync the schema with your database:
   ```bash
   npm run prisma:migrate
   ```
   *Alternatively, for rapid prototyping without creating migration histories:*
   ```bash
   npx prisma db push
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

## Running the Application

- **Development Mode**:
  ```bash
  npm run dev
  ```
  The server will start on port 5000 (depending on your `.env` config).

- **Production Mode**:
  ```bash
  npm run build
  npm start
  ```

## API Documentation

We use Swagger for API documentation. When the server is running, you can access the Swagger UI by holding `Ctrl` and clicking the link in your terminal, or by navigating to:
```
http://localhost:5000/api/docs
```
*(Replace `5000` with your configured port).*

## Roles & Entities Overview

- **Roles**: `GUEST` (Travelers), `HOST` (Service Providers), `ADMIN` (System Administrators).
- **Teams**: Hosts can organize under "Teams". Team IDs follow a `tm_` prefix logic for easy identification.
- **Listings**: Uses a highly scalable architecture to support multiple service types. Specific categories (Cars, Stays, etc.) store their unique traits in a dynamic JSON `attributes` field.
