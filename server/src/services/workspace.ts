import { JWT } from 'google-auth-library';
import { query } from '../db';
import type { User, UserResponse, WorkspaceSyncMetadata } from '../types';

interface DirectoryUser {
  primaryEmail: string;
  name?: { fullName?: string };
  thumbnailPhotoUrl?: string;
}

const WORKSPACE_SETTING_KEY = 'workspace_sync_metadata';

export const getWorkspaceSyncMetadata = async (): Promise<WorkspaceSyncMetadata> => {
  const result = await query<{ value: string }>('SELECT value FROM settings WHERE key = $1', [WORKSPACE_SETTING_KEY]);

  if (result.rows.length === 0) {
    return {
      lastSyncedAt: null,
      syncedCount: 0,
      importedCount: 0,
      updatedCount: 0,
      sampleUsers: [],
    };
  }

  try {
    return JSON.parse(result.rows[0].value) as WorkspaceSyncMetadata;
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

const saveWorkspaceMetadata = async (metadata: WorkspaceSyncMetadata): Promise<void> => {
  const existingResult = await query('SELECT key FROM settings WHERE key = $1', [WORKSPACE_SETTING_KEY]);

  if (existingResult.rows.length > 0) {
    await query(
      'UPDATE settings SET value = $1, updatedat = NOW() WHERE key = $2',
      [JSON.stringify(metadata), WORKSPACE_SETTING_KEY]
    );
  } else {
    await query(
      'INSERT INTO settings (key, value) VALUES ($1, $2)',
      [WORKSPACE_SETTING_KEY, JSON.stringify(metadata)]
    );
  }
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

  for (const dirUser of directoryUsers) {
    const email = dirUser.primaryEmail?.toLowerCase();
    if (!email) continue;

    const name = dirUser.name?.fullName || email.split('@')[0];
    const profilePhoto = dirUser.thumbnailPhotoUrl || null;

    const existingResult = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
    const existing = existingResult.rows[0];

    if (existing) {
      await query(
        'UPDATE users SET name = $1, profilephoto = $2, isactive = 1, updatedat = NOW() WHERE email = $3',
        [name, profilePhoto, email]
      );
      updatedCount += 1;
    } else {
      await query(
        `INSERT INTO users (email, password, name, role, profilephoto, isactive, createdat, updatedat)
         VALUES ($1, $2, $3, $4, $5, 1, NOW(), NOW())`,
        [email, '', name, 'user', profilePhoto]
      );
      importedCount += 1;
    }
  }

  const metadata: WorkspaceSyncMetadata = {
    lastSyncedAt: new Date().toISOString(),
    syncedCount: directoryUsers.length,
    importedCount,
    updatedCount,
    sampleUsers: directoryUsers.slice(0, 5).map((u) => u.primaryEmail).filter(Boolean) as string[],
  };

  await saveWorkspaceMetadata(metadata);
  return metadata;
};
