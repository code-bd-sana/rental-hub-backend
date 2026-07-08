# Authentication & Roles Architecture Plan

## 1. Role Overview & Access Matrix

The system will support 5 distinct roles, each with specific registration flows and data profiles:

| Role | Registration Method | Profile Complexity | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **GUEST** | Public Registration | Medium (Preferences, Subs) | Browsing, booking, managing own history. |
| **HOST** | Public Registration (Multi-step) | High (Business details, Docs) | Managing listings, accepting bookings, payouts. |
| **LOADER** | Admin Dashboard | Low (Basic Info only) | Internal tasks (specifics to be defined). |
| **AGENT** | Admin Dashboard | Medium (Custom Permissions) | Admin-delegated tasks, support, moderation. |
| **SUPER_ADMIN**| CLI Script / Seed | Low (Basic Info only) | Unrestricted access, system configuration. |

---

## 2. Database Schema Strategy (Prisma)

To maintain a clean and scalable database, we will use a **Base User + Profile Delegation** pattern. 
All shared authentication data lives in the `User` table, while role-specific data lives in connected profile tables.

### 2.1 Enums Needed
```prisma
enum Role { GUEST, HOST, LOADER, AGENT, SUPER_ADMIN }
enum HostType { RENTAL_PROPERTY_REGISTERED, INDIVIDUAL_PROPERTY, CAR_RENTAL, RESTAURANT, BARBERSHOP, SPA_SALON }
enum HostApprovalStatus { PENDING, APPROVED, REJECTED, SUSPENDED }
enum DocumentType { GOV_ID, KKF_CERTIFICATE, OWNERSHIP_PROOF, PROPERTY_INSURANCE, TAX_DOCUMENT, HANDEL_PERMIT, LOGO, OTHER }
```

### 2.2 Models
*   **`User`**: `id`, `name`, `email`, `phone`, `password`, `role`, `isActive`, `createdAt`.
*   **`GuestProfile`**: Linked to User. Fields: `countriesToVisit` (String[]), `interests` (String), `allergies` (String), `extraText` (String), `subscriptionStatus` (Boolean/Enum).
*   **`AgentProfile`**: Linked to User. Fields: `permissions` (JSON object/array to dynamically store various role and work permissions for easy future updates).
*   **`HostProfile`**: Linked to User. Fields: `hostTypes` (HostType[] - handles multiple at once), `businessName`, `location`, `address`, `country`, `city`, `state`, `registrationNumber`, `description`, `approvalStatus` (Default: PENDING). *(All business details and documents are completely optional during registration. They can submit basic info to enter PENDING state. Admin reviews whatever is provided and decides to approve, reject, or request more info).*
*   **`HostDocument`**: 1-to-Many with HostProfile. Fields: `documentType`, `fileUrl` (GCP Storage URL), `uploadedAt`.

---

## 3. API Endpoints Architecture

### 3.1 Public Auth Routes (`/api/v1/auth`)
*   `POST /auth/login`: Universal login for all roles. Returns JWT + Role.
*   `POST /auth/register/guest`: Creates User + GuestProfile atomically.
*   `POST /auth/register/host`: Handles multipart/form-data. Creates User + HostProfile + HostDocuments atomically. Status set to `PENDING`.

### 3.2 Internal Admin Routes (`/api/v1/admin/users`)
*   `POST /admin/users/agent`: Creates Agent (Requires SUPER_ADMIN).
*   `POST /admin/users/loader`: Creates Loader (Requires SUPER_ADMIN or AGENT with perm).
*   `PATCH /admin/users/host/:id/approve`: Approves a pending host (Requires SUPER_ADMIN or AGENT with perm).

---

## 4. Host Multi-Step Registration Strategy

Because the Host registration involves file uploads and multiple steps, we have two backend strategies:
1.  **Stateful/Draft Strategy (Recommended)**: The frontend sends Step 1 (Basic Info) -> Backend creates User with `DRAFT` status -> Frontend sends Step 2 (Business Info) -> Backend updates profile -> Frontend uploads documents -> Backend finalizes status to `PENDING`.
2.  **Stateless/All-at-once Strategy**: The frontend collects all steps in React state, then submits one massive `multipart/form-data` request at the very end.

*We will proceed with Strategy 2 (Stateless) as it prevents database clutter from abandoned registrations, unless files are too large.*

### File Upload Handling (Local -> GCP Ready)
*   We will use `multer` to handle file uploads.
*   **Storage Strategy**: For now, files will be saved locally in an `uploads/` directory at the project root, organized folder-wise (e.g., `uploads/hosts/documents/`). 
*   **GCP Readiness**: We will build an abstract `FileUploadService` (an adapter pattern). Currently, it will save files to the local file system. Later, migrating to GCP will only require updating this single service file without touching any controller or business logic. The DB will store relative paths or URLs.

---

## 5. Execution Steps
1.  **Schema Implementation**: Update `schema.prisma` with the Base + Profile architecture. Run migrations.
2.  **Super Admin CLI**: Write `src/scripts/seed-admin.ts` to generate the first admin.
3.  **Zod Validations**: Write strict schemas for Agent creation, Guest registration, and the complex Host registration (handling optionality).
4.  **Multer Configuration**: Set up file parsing middleware for Host documents.
5.  **Service Logic**: Write transactional Prisma queries to ensure if a profile creation fails, the base user is rolled back.
6.  **Controllers & Routes**: Expose the endpoints.
