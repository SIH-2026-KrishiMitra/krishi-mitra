import type { ReactNode } from 'react'

export type AdminSubRole =
  | 'super_admin'
  | 'finance_admin'
  | 'support_admin'
  | 'verification_admin'

export interface AdminPermissions {
  canViewUsers: boolean
  canManageUsers: boolean
  canViewKyc: boolean
  canManageKyc: boolean
  canViewMarketplace: boolean
  canViewOrders: boolean
  canViewFinancials: boolean
  canManageFinancials: boolean
  canViewComplaints: boolean
  canManageComplaints: boolean
  canViewReviews: boolean
  canManageNotifications: boolean
  canViewAnalytics: boolean
  canManageAdmins: boolean
  canViewAuditLogs: boolean
  canManageSettings: boolean
}

const ALL: AdminPermissions = {
  canViewUsers: true,
  canManageUsers: true,
  canViewKyc: true,
  canManageKyc: true,
  canViewMarketplace: true,
  canViewOrders: true,
  canViewFinancials: true,
  canManageFinancials: true,
  canViewComplaints: true,
  canManageComplaints: true,
  canViewReviews: true,
  canManageNotifications: true,
  canViewAnalytics: true,
  canManageAdmins: true,
  canViewAuditLogs: true,
  canManageSettings: true,
}

const NONE: AdminPermissions = {
  canViewUsers: false,
  canManageUsers: false,
  canViewKyc: false,
  canManageKyc: false,
  canViewMarketplace: false,
  canViewOrders: false,
  canViewFinancials: false,
  canManageFinancials: false,
  canViewComplaints: false,
  canManageComplaints: false,
  canViewReviews: false,
  canManageNotifications: false,
  canViewAnalytics: false,
  canManageAdmins: false,
  canViewAuditLogs: false,
  canManageSettings: false,
}

export function getPermissions(subRole: AdminSubRole | null): AdminPermissions {
  switch (subRole) {
    case 'super_admin': return ALL
    case 'finance_admin': return {
      ...NONE,
      canViewOrders: true,
      canViewFinancials: true,
      canManageFinancials: true,
      canViewAnalytics: true,
      canViewAuditLogs: true,
    }
    case 'support_admin': return {
      ...NONE,
      canViewUsers: true,
      canViewOrders: true,
      canViewComplaints: true,
      canManageComplaints: true,
      canManageNotifications: true,
      canViewAuditLogs: true,
    }
    case 'verification_admin': return {
      ...NONE,
      canViewUsers: true,
      canManageUsers: true,
      canViewKyc: true,
      canManageKyc: true,
      canViewAuditLogs: true,
    }
    default: return ALL
  }
}

// ─── PermissionGate ───────────────────────────────────────────────────────────

interface PermissionGateProps {
  permissions: AdminPermissions
  requires: keyof AdminPermissions
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permissions, requires, children, fallback }: PermissionGateProps) {
  if (permissions[requires]) return <>{children}</>
  if (fallback !== undefined) return <>{fallback}</>
  return (
    <div style={{
      padding: '48px 24px',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: 'var(--text-sm)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Access restricted</p>
      <p>Your admin role does not include permission to view this section.</p>
    </div>
  )
}
