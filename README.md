# Enterprise Hospital Management System (HMS)

## Overview
Enterprise-HMS is a modern, highly scalable, multi-tenant Hospital Management System designed to handle complex hospital structures, including multi-branch hospitals, extensive administrative hierarchies, and detailed departmental operations. 

## Current System Architecture

The application follows a decoupled client-server architecture:
- **Frontend**: A Single Page Application (SPA) built with React (Vite) and styled with Tailwind CSS. It is structured into logical, role-based modules for clear separation of concerns.
- **Backend**: A RESTful API built on Node.js using Express.
- **Database Architecture**: Managed using Prisma ORM. The system employs a multi-tenant architectural design where a single global instance handles multiple hospitals, each containing multiple branches, with dedicated schemas for operations, RBAC, and tenant configurations.

---

## Implemented Modules

### 1. Platform Admin Module
- **Creating Hospital**: Global management and onboarding of new hospital tenants into the system.
- **Tenant Configuration**: Managing global configurations and hospital-wide settings.

### 2. Hospital Admin Module
- **Manage Branch Admin**: Centralized creation and administration of branch-level administrators.
- **Hospital Theme**: Customization of hospital branding, themes, and UI elements.
- **Manage Hospital Admin**: Creation and management of hospital-level administrative accounts.

### 3. Branch Admin Module
- **Manage Departments**: Creation, updating, and operation of hospital departments specific to a branch.
- **Manage Fees**: Linking and handling specific operational fees per department (e.g., OP consultation, IP charges).

### 4. Global Modules (Authentication & IAM)
- **Auth**: Centralized user authentication flow.
- **Roles & Permissions**: Fine-grained access control to manage capabilities at Platform, Hospital, and Branch levels.

---

## Folder Structure

### Root Directory
```text
/Enterprise-HMS
├── Backend/                 # Express REST API & Database Models
│   ├── prisma/              # Prisma Schemas & Database configuration
│   │   ├── schema/          # Split Prisma schemas (tenant.prisma, operations.prisma, etc.)
│   ├── src/
│   │   ├── config/          # Environment & Database Configurations
│   │   ├── middlewares/     # Auth, Error handling, Logging middlewares
│   │   ├── modules/         # Domain-driven backend modules (auth, createHospital, BranchManagement, etc.)
│   │   ├── utils/           # Helper functions and utilities
│   │   └── app.js / server.js
└── Frontend/                # React UI App (Vite)
    ├── src/
    │   ├── modules/         # Role-based frontend modules (PlatformAdmin, HospitalAdmin, BranchAdmin)
    │   ├── components/      # Shared/Reusable UI components
    │   ├── hooks/           # Custom React hooks
    │   └── App.jsx
```

---

## Database Architecture & Data Models

The Prisma ORM is heavily modularized for a multi-tenant environment:

### Core Tenant Models (`tenant.prisma`)
- **Hospital**: The root tenant entity containing branding, global settings, and metadata.
- **BranchManage**: Represents physical branches operating under a Hospital.
- **HospitalAdmin / BranchAdmin**: Dedicated administrative entities referencing global users, scoped to their respective tenant or sub-tenant levels.

### Operational Models (`operations.prisma`)
- **ManageDepartment**: Departments scoped per hospital branch (e.g., Cardiology, Radiology).
- **ManageFee**: Specific operational fees tied to hospitals, branches, and departments.

### RBAC / IAM Models
- **User**: The global identity for login authentication.
- **Roles & Permissions**: Structured hierarchies defining access levels.

---

## Role-Based Access Control (RBAC) & IAM

The system implements a strict hierarchical IAM (Identity and Access Management) structure:
1. **Platform Administrator**: System-wide control. Can onboard hospitals, suspend tenants, and oversee global operations.
2. **Hospital Administrator**: Tenant-level control. Can manage hospital settings, branding, create branches, and assign Branch Administrators.
3. **Branch Administrator**: Sub-tenant control. Can manage operations within a specific branch, such as creating departments, setting fees, and managing branch-specific staff.
4. **Staff / End-Users (Planned)**: Restricted access based on departmental roles (e.g., Doctors, Receptionists).

---

## Next Development Phases / Future Architecture

### Phase 1: Patient Management & EHR (Electronic Health Records)
- Patient Registration (IPD/OPD)
- Medical histories, diagnosis, and prescription management.
- Digital document storage for lab reports.

### Phase 2: Billing & Financial Accounting
- Comprehensive invoicing and billing engines.
- Tax configuration and automated financial reporting.
- Payment gateway integration for online fee collection.

### Phase 3: Advanced Scheduling & Appointment Management
- Doctor availability calendars and rostering.
- Patient appointment booking flows.
- SMS / Email notifications and reminders.

### Phase 4: Inventory & Pharmacy Management
- Stock tracking, procurement requests, and supplier management.
- Point-of-Sale (POS) integration for in-house pharmacies.

### Phase 5: Telemedicine & Patient Portal
- Dedicated mobile-responsive portals for patients.
- Video consultation integrations.
