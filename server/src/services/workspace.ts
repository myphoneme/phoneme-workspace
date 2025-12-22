import { JWT } from 'google-auth-library';
import db from '../db';
import type { User, UserResponse, WorkspaceSyncMetadata } from '../types';

interface DirectoryUser {
  primaryEmail: string;
  name?: { fullName?: string };
  thumbnailPhotoUrl?: string;
}

const WORKSPACE_SETTING_KEY = 'workspace_sync_metadata';

const getWorkspaceMetadata = (): WorkspaceSyncMetadata => {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(WORKSPACE_SETTING_KEY) as
    | { value: string }
    | undefined;

  if (!row) {
    return {
      lastSyncedAt: null,
      syncedCount: 0,
      importedCount: 0,
      updatedCount: 0,
      sampleUsers: [],
    };
  }

  try {
    return JSON.parse(row.value) as WorkspaceSyncMetadata;
  } catch {
    return {
      lastSyncedAt: null,
      syncedCount: 0,
      importedCount: 0,
      updatedCount: 0,
      sampleUsers: [],
    };
  }
};

const saveWorkspaceMetadata = (metadata: WorkspaceSyncMetadata): void => {
  db.prepare(
    `
    INSERT INTO settings (key, value, updatedAt)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now')
  `,
  ).run(WORKSPACE_SETTING_KEY, JSON.stringify(metadata));
};

const fetchWorkspaceUsers = async (): Promise<DirectoryUser[]> => {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const adminUser = process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL;

  if (!serviceAccountKey || !adminUser) {
    throw new Error('Workspace sync requires GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_WORKSPACE_ADMIN_EMAIL env vars.');
  }

  const parsedKey = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf8'));

  const client = new JWT({
    email: parsedKey.client_email,
    key: parsedKey.private_key,
    scopes: ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
    subject: adminUser,
  });

  const response = await client.request<{ users?: DirectoryUser[] }>({
    url: 'https://admin.googleapis.com/admin/directory/v1/users',
    params: { customer: 'my_customer', maxResults: 200 },
  });

  return response.data.users ?? [];
};

export const syncWorkspaceUsers = async (): Promise<WorkspaceSyncMetadata> => {
  const directoryUsers = await fetchWorkspaceUsers();
  let importedCount = 0;
  let updatedCount = 0;

  directoryUsers.forEach((dirUser) => {
    const email = dirUser.primaryEmail?.toLowerCase();
    if (!email) return;

    const name = dirUser.name?.fullName || email.split('@')[0];
    const profilePhoto = dirUser.thumbnailPhotoUrl || null;

    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

    if (existing) {
      db.prepare(
        `
        UPDATE users
        SET name = ?, profilePhoto = ?, isActive = 1, updatedAt = datetime('now')
        WHERE email = ?
      `,
      ).run(name, profilePhoto, email);
      updatedCount += 1;
    } else {
      db.prepare(
        `
        INSERT INTO users (email, password, name, role, profilePhoto, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
      `,
      ).run(email, '', name, 'user', profilePhoto);
      importedCount += 1;
    }
  });

  const metadata: WorkspaceSyncMetadata = {
    lastSyncedAt: new Date().toISOString(),
    syncedCount: directoryUsers.length,
    importedCount,
    updatedCount,
    sampleUsers: directoryUsers.slice(0, 5).map((u) => u.primaryEmail).filter(Boolean) as string[],
  };

  saveWorkspaceMetadata(metadata);
  return metadata;
};

export const getWorkspaceSyncMetadata = (): WorkspaceSyncMetadata => getWorkspaceMetadata();
