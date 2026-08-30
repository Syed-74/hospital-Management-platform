// Centralized permission constants for Enterprise HMS RBAC

// Platform Admin Level Permissions
export const PLATFORM_ACCESS = "platform:access";
export const SUBSCRIPTIONS_MANAGE = "subscriptions:manage";
export const HOSPITAL_CREATE = "hospitals:create";
export const HOSPITAL_VIEW = "hospitals:read";
export const HOSPITAL_UPDATE = "hospitals:update";
export const HOSPITAL_DELETE = "hospitals:delete";
export const HOSPITAL_ADMIN_CREATE = "hospitalAdmins:create";
export const HOSPITAL_ADMIN_VIEW = "hospitalAdmins:read";
export const HOSPITAL_ADMIN_UPDATE = "hospitalAdmins:update";
export const HOSPITAL_ADMIN_DELETE = "hospitalAdmins:delete";

// Core Identity & Access Control Management
export const ROLE_MANAGE = "roles:manage";
export const PERMISSION_MANAGE = "permissions:manage";
export const USER_VIEW = "users:read";
export const USER_ASSIGN_ROLES = "users:assign_roles";
export const BRANCH_ADMIN_VIEW = "branchAdmins:read";
export const BRANCH_ADMIN_MANAGE = "branchAdmins:manage";

// Hospital Admin Level Permissions
export const HOSPITAL_ACCESS = "hospital:access";
export const BRANCH_MANAGE = "branch:manage";
export const BRANCH_VIEW = "branch:read";
export const HOSPITAL_USER_MANAGE = "hospitalUsers:manage";
export const HOSPITAL_USER_VIEW = "hospitalUsers:read";
export const THEME_MANAGE = "themes:manage";
export const THEME_VIEW = "themes:read";

// Branch / Department Level Permissions
export const BILLING_MANAGE = "billing:manage";
export const BILLING_VIEW = "billing:read";
export const PATIENT_MANAGE = "patients:manage";
export const PATIENT_VIEW = "patients:read";
export const CLINICAL_WRITE = "clinical:write";
export const CLINICAL_VIEW = "clinical:read";
export const INVENTORY_MANAGE = "inventory:manage";
export const INVENTORY_VIEW = "inventory:read";
