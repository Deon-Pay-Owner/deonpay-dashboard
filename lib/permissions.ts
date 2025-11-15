/**
 * Roles and Permissions System
 * Defines all roles, permissions, and access control for the dashboard
 */

import {
  Crown,
  Zap,
  DollarSign,
  Code2,
  Headphones,
  Eye,
  type LucideIcon
} from 'lucide-react'

export type Role = 'owner' | 'admin' | 'finance' | 'developer' | 'support' | 'viewer'

export type Permission =
  // General
  | 'view_dashboard'
  // Transactions
  | 'view_transactions'
  | 'view_transaction_details'
  | 'view_transaction_amounts'
  | 'process_refunds'
  | 'export_transactions'
  // Customers
  | 'view_customers'
  | 'view_customer_details'
  | 'edit_customers'
  | 'delete_customers'
  // API Keys
  | 'view_api_keys'
  | 'generate_api_keys'
  | 'revoke_api_keys'
  // Webhooks
  | 'view_webhooks'
  | 'create_webhooks'
  | 'edit_webhooks'
  | 'delete_webhooks'
  | 'test_webhooks'
  // Documentation
  | 'view_documentation'
  // Account
  | 'view_account'
  | 'edit_account'
  | 'manage_users'
  | 'delete_account'

export interface RoleDefinition {
  id: Role
  name: string
  description: string
  color: string
  icon: LucideIcon
  permissions: Permission[]
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  owner: {
    id: 'owner',
    name: 'Propietario',
    description: 'Control total del merchant. Único rol con acceso a configuraciones críticas y gestión de usuarios.',
    color: 'var(--color-primary)',
    icon: Crown,
    permissions: [
      'view_dashboard',
      'view_transactions',
      'view_transaction_details',
      'view_transaction_amounts',
      'process_refunds',
      'export_transactions',
      'view_customers',
      'view_customer_details',
      'edit_customers',
      'delete_customers',
      'view_api_keys',
      'generate_api_keys',
      'revoke_api_keys',
      'view_webhooks',
      'create_webhooks',
      'edit_webhooks',
      'delete_webhooks',
      'test_webhooks',
      'view_documentation',
      'view_account',
      'edit_account',
      'manage_users',
      'delete_account',
    ],
  },
  admin: {
    id: 'admin',
    name: 'Administrador',
    description: 'Gestión operativa completa. Puede administrar transacciones, clientes y webhooks.',
    color: 'var(--color-info)',
    icon: Zap,
    permissions: [
      'view_dashboard',
      'view_transactions',
      'view_transaction_details',
      'view_transaction_amounts',
      'process_refunds',
      'export_transactions',
      'view_customers',
      'view_customer_details',
      'edit_customers',
      'delete_customers',
      'view_api_keys',
      'view_webhooks',
      'create_webhooks',
      'edit_webhooks',
      'delete_webhooks',
      'test_webhooks',
      'view_documentation',
      'view_account',
      'edit_account',
    ],
  },
  finance: {
    id: 'finance',
    name: 'Finanzas',
    description: 'Enfocado en aspectos financieros. Gestiona transacciones, reembolsos y reportes.',
    color: 'var(--color-success)',
    icon: DollarSign,
    permissions: [
      'view_dashboard',
      'view_transactions',
      'view_transaction_details',
      'view_transaction_amounts',
      'process_refunds',
      'export_transactions',
      'view_customers',
      'view_customer_details',
      'view_documentation',
    ],
  },
  developer: {
    id: 'developer',
    name: 'Desarrollador',
    description: 'Enfocado en integración técnica. Gestiona API keys, webhooks y documentación.',
    color: 'var(--color-warning)',
    icon: Code2,
    permissions: [
      'view_dashboard',
      'view_transactions',
      'view_transaction_details',
      'view_api_keys',
      'generate_api_keys',
      'revoke_api_keys',
      'view_webhooks',
      'create_webhooks',
      'edit_webhooks',
      'delete_webhooks',
      'test_webhooks',
      'view_documentation',
    ],
  },
  support: {
    id: 'support',
    name: 'Soporte',
    description: 'Atención al cliente. Visualiza transacciones y clientes sin realizar modificaciones.',
    color: 'var(--color-info)',
    icon: Headphones,
    permissions: [
      'view_dashboard',
      'view_transactions',
      'view_transaction_details',
      'view_transaction_amounts',
      'view_customers',
      'view_customer_details',
      'view_documentation',
    ],
  },
  viewer: {
    id: 'viewer',
    name: 'Solo Lectura',
    description: 'Vista general sin modificaciones. Solo puede visualizar información básica.',
    color: 'var(--color-textSecondary)',
    icon: Eye,
    permissions: [
      'view_dashboard',
      'view_transactions',
      'view_transaction_amounts',
      'view_customers',
      'view_documentation',
    ],
  },
}

/**
 * Permission labels for UI display
 */
export const PERMISSION_LABELS: Record<Permission, string> = {
  view_dashboard: 'Ver dashboard general',
  view_transactions: 'Ver lista de transacciones',
  view_transaction_details: 'Ver detalles de transacciones',
  view_transaction_amounts: 'Ver montos de transacciones',
  process_refunds: 'Procesar reembolsos',
  export_transactions: 'Exportar transacciones',
  view_customers: 'Ver lista de clientes',
  view_customer_details: 'Ver detalles de clientes',
  edit_customers: 'Editar clientes',
  delete_customers: 'Eliminar clientes',
  view_api_keys: 'Ver API keys',
  generate_api_keys: 'Generar API keys',
  revoke_api_keys: 'Revocar API keys',
  view_webhooks: 'Ver webhooks',
  create_webhooks: 'Crear webhooks',
  edit_webhooks: 'Editar webhooks',
  delete_webhooks: 'Eliminar webhooks',
  test_webhooks: 'Probar webhooks',
  view_documentation: 'Ver documentación',
  view_account: 'Ver información de cuenta',
  edit_account: 'Editar información de cuenta',
  manage_users: 'Gestionar usuarios y permisos',
  delete_account: 'Eliminar cuenta',
}

/**
 * Permission categories for organized display
 */
export const PERMISSION_CATEGORIES = {
  general: {
    name: 'General',
    permissions: ['view_dashboard'] as Permission[],
  },
  transactions: {
    name: 'Transacciones',
    permissions: [
      'view_transactions',
      'view_transaction_details',
      'view_transaction_amounts',
      'process_refunds',
      'export_transactions',
    ] as Permission[],
  },
  customers: {
    name: 'Clientes',
    permissions: [
      'view_customers',
      'view_customer_details',
      'edit_customers',
      'delete_customers',
    ] as Permission[],
  },
  api_keys: {
    name: 'API Keys',
    permissions: [
      'view_api_keys',
      'generate_api_keys',
      'revoke_api_keys',
    ] as Permission[],
  },
  webhooks: {
    name: 'Webhooks',
    permissions: [
      'view_webhooks',
      'create_webhooks',
      'edit_webhooks',
      'delete_webhooks',
      'test_webhooks',
    ] as Permission[],
  },
  documentation: {
    name: 'Documentación',
    permissions: ['view_documentation'] as Permission[],
  },
  account: {
    name: 'Cuenta',
    permissions: [
      'view_account',
      'edit_account',
      'manage_users',
      'delete_account',
    ] as Permission[],
  },
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_DEFINITIONS[role].permissions.includes(permission)
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_DEFINITIONS[role].permissions
}

/**
 * Get role definition
 */
export function getRoleDefinition(role: Role): RoleDefinition {
  return ROLE_DEFINITIONS[role]
}

/**
 * Get all available roles (excluding owner for invitations)
 */
export function getInvitableRoles(): RoleDefinition[] {
  return Object.values(ROLE_DEFINITIONS).filter(role => role.id !== 'owner')
}
