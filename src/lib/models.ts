import { prisma } from "@/lib/prisma";

export const Models = {
  User: prisma.user,
  Workspace: prisma.workspace,
  WorkspaceMember: prisma.workspaceMember,
  WorkspaceInvite: prisma.workspaceInvite,

  // DOCUMENT SYSTEM
  WorkspaceDocument: prisma.workspaceDocument,
  WorkspaceDocumentActivity: prisma.workspaceDocumentActivity,
  DocumentShare: prisma.documentShare,

  DocumentPresence: prisma.documentPresence,
  DocumentMessage: prisma.documentMessage,
  DocumentComment: prisma.documentComment,
  DocumentVersion: prisma.documentVersion,
  DocumentSnapshot: prisma.documentSnapshot,
  DocumentPatch: prisma.documentPatch,

  // GRANTS
  Grant: prisma.grant,
  SavedGrant: prisma.savedGrant,

  // BILLING
  WorkspaceBilling: prisma.workspaceBilling,
  WorkspaceBillingActivity: prisma.workspaceBillingActivity,
  BillingLog: prisma.billingLog,
  WorkspaceSuspensionLog: prisma.workspaceSuspensionLog,

  // AI
  AiEventLog: prisma.aiEventLog,

  // NOTIFICATIONS
  Notification: prisma.notification,
  WorkspaceNotification: prisma.workspaceNotification,
};
