// src/lib/config.ts

export const LAUNCH_MODE = true;

/**
 * When LAUNCH_MODE = true:
 * - AI routes return { disabled: true }
 * - ACL routes return { disabled: true }
 * - ingestion routes return { disabled: true }
 * - admin/superadmin heavy routes return { disabled: true }
 * - analytics routes return { disabled: true }
 * - experimental routes return { disabled: true }
 *
 * After launch, set LAUNCH_MODE = false.
 */
