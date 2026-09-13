# Backend Starter Kit Instructions

This starter is a Node.js + Express + Prisma + MongoDB backend template. It is designed to help you build a clean API quickly without repeating the same setup over and over.

---

## 1) Project Purpose

This project gives you:

- Express API structure
- Prisma ORM for MongoDB
- JWT-based auth flow
- User management with admin role support
- Request validation with Zod
- File upload helper support
- Docker setup for development and production
- Ready-made module generator

---

## 2) Main Tools Used

- Node.js
- TypeScript
- Express
- Prisma
- MongoDB
- Docker
- Zod
- JWT

---

## 3) How to Start the Project

### Step 1: Install dependencies

```bash
npm install
```

or if you use pnpm:

```bash
pnpm install
```

### Step 2: Copy environment file

Create your own .env file from the example file:

```bash
cp .env.example .env
```

Then update the values in .env properly, especially:

- DATABASE_URL
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD

### Step 3: Generate Prisma client

```bash
npm run db:generate
```

### Step 4: Push schema to database

```bash
npm run db:push
```

### Step 5: Start development server

```bash
npm run dev
```

The server will run with ts-node-dev and restart automatically on file changes.

### Step 6: Check app health

Open in browser:

```text
http://localhost:5000/health
```

You can also visit:

```text
http://localhost:5000/
```

---

## 4) Docker Usage

### Development mode

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Production mode

```bash
docker compose up --build
```

The Docker files are linked to .env and the app uses the project container for backend execution.

---

## 5) Folder Structure and What Each Folder Does

```text
backend-nodejs-prisma-docker-starter/
├── src/
│   ├── app/
│   │   ├── middlewares/
│   │   │   ├── auth.ts                 # JWT/auth guard middleware
│   │   │   ├── fileUploader.ts         # file upload config
│   │   │   ├── globalErrorHandler.ts   # central error handler
│   │   │   ├── parseBodyData.ts        # body parsing helper
│   │   │   └── validateRequest.ts      # Zod request validation
│   │   ├── modules/
│   │   │   ├── Auth/
│   │   │   │   ├── auth.controller.ts  # auth logic handlers
│   │   │   │   ├── auth.routes.ts      # route definitions
│   │   │   │   ├── auth.service.ts     # business logic
│   │   │   │   ├── auth.utils.ts       # token/cookie helpers
│   │   │   │   └── auth.validation.ts  # input validation zod schemas
│   │   │   └── User/
│   │   │       ├── user.controller.ts
│   │   │       ├── user.route.ts
│   │   │       ├── user.service.ts
│   │   │       ├── user.validation.ts
│   │   │       └── user.costant.ts
│   │   └── routes/
│   │       └── index.ts                # group all module routes here
│   ├── config/
│   │   └── env.config.ts               # environment validation using Zod
│   ├── db/
│   │   └── seed.ts                     # default admin seeding logic
│   ├── errors/
│   │   ├── ApiErrors.ts
│   │   ├── ApiPathError.ts
│   │   ├── handleClientError.ts
│   │   ├── handleValidationError.ts
│   │   ├── handleZodError.ts
│   │   └── parsePrismaValidationError.ts
│   ├── helpers/
│   │   ├── emailSender.ts              # Email sending helper
│   │   ├── fileUploaderCloud.ts        # cloud file upload
│   │   ├── jwtHelpers.ts               # token helper
│   │   ├── stripe.ts                   # stripe integration
│   │   ├── uploadFileCloud.ts          # file upload wrapper
│   │   └── uploadToS3.ts               # S3 upload helper
│   ├── interfaces/
│   │   ├── common.ts
│   │   ├── error.ts
│   │   ├── file.ts
│   │   └── index.d.ts
│   ├── jobs/
│   ├── shared/
│   │   ├── catchAsync.ts               # wrapper for async route handlers
│   │   ├── pick.ts                     # query selection helper
│   │   ├── prisma.ts                   # Prisma client instance
│   │   └── sendResponse.ts             # standardized API response helper
│   ├── utils/
│   │   ├── BodyTemplate.ts             # HTML response template
│   │   ├── generateOtp.ts              # OTP generator
│   │   └── ...
│   ├── app.ts                          # express app setup
│   └── server.ts                       # server bootstrap
├── prisma/
│   └── schema.prisma                   # Prisma schema and MongoDB models
├── public/
│   ├── analyze-prompt.txt
│   └── cleaned-analysis.json
├── uploads/
│   └── uploaded files go here
├── .env.example
├── docker-compose.yml
├── docker-compose.dev.yml
├── Dockerfile
├── generate-module.ts                  # module generator script
├── package.json                        # scripts and dependencies
├── README.md                           # project documentation
├── tsconfig.json
├── vercel.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── INSTRUCTION.md
```

---

## 6) How the Request Flow Works

A normal request follows this pattern:

```text
Request --> route file --> controller --> service --> prisma/database --> response
```

Example:

```text
src/app/modules/Auth/auth.routes.ts
    -> auth.controller.ts
    -> auth.service.ts
    -> prisma.user / prisma.authChallenge
```

### Example of an Auth flow

- User hits /api/v1/auth/register
- route is defined in auth.routes.ts
- controller receives request
- service checks validation and business rules
- Prisma saves or reads data
- response is returned to client

---

## 7) How to Add a New Module

This project already includes a module generator.

### Example

```bash
npm run generate:module -- product
```

This creates a new module under:

```text
src/app/modules/Product/
```

The generated files include:

- product.route.ts
- product.controller.ts
- product.service.ts
- product.validation.ts

Then you need to register it in:

```text
src/app/routes/index.ts
```

Example:

```ts
{
  path: "/products",
  route: ProductRoutes,
}
```

---

## 8) How to Work with Prisma

### Schema file

```text
prisma/schema.prisma
```

This is the database structure file. If you change models, run:

```bash
npx prisma generate
npx prisma db push
```

### Prisma client access

The shared Prisma client is created here:

```text
src/shared/prisma.ts
```

Use it like:

```ts
import prisma from "../shared/prisma";
```

---

## 9) Auth and Middleware Usage

Important middleware files:

- src/app/middlewares/auth.ts
  - checks JWT token and user role
- src/app/middlewares/validateRequest.ts
  - validates request payloads with Zod
- src/app/middlewares/globalErrorHandler.ts
  - handles thrown API errors centrally

Use route protection like:

```ts
router.get("/me", auth(), UserController.getMe);
router.get("/", auth(UserRole.ADMIN), UserController.getAllUsers);
```

---

## 10) Useful Scripts

From package.json:

```bash
npm run dev
npm run build
npm run build:check
npm run db:generate
npm run db:push
npm run db:studio
npm run generate:module
npm run dev:docker
```

---

## 11) Recommended Development Flow

1. Create .env file
2. Start project locally
3. Review route and module structure
4. Build your feature in a new module
5. Connect service + validation + controller
6. Register route in index.ts
7. Run build check before pushing

---

## 12) Common Locations for Feature Work

If you want to add a new feature, start here:

- API route: src/app/modules/<Feature>/<feature>.routes.ts
- Controller: src/app/modules/<Feature>/<feature>.controller.ts
- Service: src/app/modules/<Feature>/<feature>.service.ts
- Validation: src/app/modules/<Feature>/<feature>.validation.ts
- Register route: src/app/routes/index.ts
- Environment config: src/config/env.config.ts

---

## 13) Notes

- The app already includes auth, user management, email verification, password reset, and admin user actions.
- The backend is built for fast scale-up and modular development.
- Keep business logic in services, not controllers.
- Keep database queries centralized through Prisma.

---

## 14) Quick Start Example

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run dev
```

Then open:

```text
http://localhost:5000/health
```

This is the simplest way to get the starter running.

---

If you want, next I can help you:

1. Convert this starter into a cleaner production-ready structure
2. Add a feature module like Product, Order, or Category
3. Write a full API docs page for this starter
4. Add TypeScript naming consistency and code quality improvements
