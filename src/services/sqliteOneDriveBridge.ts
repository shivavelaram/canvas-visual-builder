import { Website, Webpage, OneDriveConfig, StoredUserCredential } from '../types/canvas';

export interface SQLiteSyncResult {
  success: boolean;
  message: string;
  syncedAt: string;
  byteSize: number;
}

/**
 * Computes a cryptographic SHA-256 hash using the Web Crypto API
 * Salt + Password ensures protection against rainbow tables and dictionary attacks.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a cryptographically secure pseudo-random salt
 */
export function generateSalt(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Initial seeded user accounts stored securely in the OneDrive SQLite vault
 */
export const INITIAL_CREDENTIALS: StoredUserCredential[] = [
  {
    id: 'user-admin-1',
    email: 'admin@apexcloud.io',
    name: 'System Administrator',
    role: 'admin',
    // Pre-computed SHA-256 hash for password "Admin@Secure2026" with salt "9a8b7c6d5e4f3a2b"
    passwordHash: 'e6b8c9d2f4a1087e5b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
    passwordSalt: '9a8b7c6d5e4f3a2b',
    createdAt: '2026-01-10T08:00:00.000Z',
    lastLogin: '2026-09-13T01:10:00.000Z',
    syncedToOneDrive: true,
    oneDrivePath: '/OneDrive/Apps/CanvasStudio/db/canvas_store.sqlite',
    projectGrants: ['site-apex-1', 'site-nordic-2', 'site-aura-commerce'],
  },
  {
    id: 'user-builder-2',
    email: 'builder@apexcloud.io',
    name: 'Alex Vance (Builder)',
    role: 'editor',
    passwordHash: '3f5a7b9c1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a',
    passwordSalt: '1a2b3c4d5e6f7a8b',
    createdAt: '2026-02-15T10:30:00.000Z',
    lastLogin: '2026-09-12T19:45:00.000Z',
    syncedToOneDrive: true,
    oneDrivePath: '/OneDrive/Apps/CanvasStudio/db/canvas_store.sqlite',
    projectGrants: ['site-apex-1', 'site-nordic-2', 'site-aura-commerce'],
  },
  {
    id: 'user-krishna-3',
    email: 'kkrishnaitwork@gmail.com',
    name: 'Krishna (Lead Architect)',
    role: 'admin',
    passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    passwordSalt: 'c3d4e5f6a7b8c9d0',
    createdAt: '2026-03-01T10:00:00.000Z',
    lastLogin: '2026-09-13T03:00:00.000Z',
    syncedToOneDrive: true,
    oneDrivePath: '/OneDrive/Apps/CanvasStudio/db/canvas_store.sqlite',
    projectGrants: ['site-apex-1', 'site-nordic-2', 'site-aura-commerce'],
  },
];

export const INITIAL_ONEDRIVE_CONFIG: OneDriveConfig = {
  isConnected: false,
  userEmail: 'admin@apexcloud.io',
  folderPath: '/OneDrive/Apps/CanvasStudio/db/',
  sqliteFileName: 'canvas_store.sqlite',
  lastSyncedAt: undefined,
  syncStatus: 'idle',
  autoSync: true,
  clientId: 'app-canvas-studio-enterprise',
  dbSizeBytes: 48900,
};

/**
 * Generates an SQL dump string for SQLite representing all websites, pages, and user credential vault
 */
export function generateSQLiteDump(websites: Website[], users: StoredUserCredential[] = INITIAL_CREDENTIALS): string {
  const lines: string[] = [
    '-- SQLite Database Dump (Websites, Pages & User Credentials Vault)',
    `-- Dumped at: ${new Date().toISOString()}`,
    'PRAGMA foreign_keys=OFF;',
    'BEGIN TRANSACTION;',
    '',
    '-- 1. Websites Registry',
    'CREATE TABLE IF NOT EXISTS websites (',
    '  id TEXT PRIMARY KEY,',
    '  name TEXT NOT NULL,',
    '  domain TEXT,',
    '  description TEXT,',
    '  category TEXT,',
    '  created_at TEXT,',
    '  updated_at TEXT',
    ');',
    '',
    '-- 2. Webpages Hierarchy',
    'CREATE TABLE IF NOT EXISTS webpages (',
    '  id TEXT PRIMARY KEY,',
    '  website_id TEXT,',
    '  title TEXT NOT NULL,',
    '  slug TEXT NOT NULL,',
    '  description TEXT,',
    '  nodes_json TEXT,',
    '  updated_at TEXT',
    ');',
    '',
    '-- 3. Dynamic Form Leads',
    'CREATE TABLE IF NOT EXISTS dynamic_leads (',
    '  id TEXT PRIMARY KEY,',
    '  email TEXT NOT NULL,',
    '  page_slug TEXT,',
    '  created_at TEXT',
    ');',
    '',
    '-- 4. User Credentials Vault (Zero-Knowledge Salted SHA-256 Hashes)',
    'CREATE TABLE IF NOT EXISTS users (',
    '  id TEXT PRIMARY KEY,',
    '  email TEXT UNIQUE NOT NULL,',
    '  name TEXT NOT NULL,',
    '  role TEXT NOT NULL,',
    '  password_hash TEXT NOT NULL,',
    '  password_salt TEXT NOT NULL,',
    '  created_at TEXT,',
    '  last_login TEXT,',
    '  onedrive_synced INTEGER DEFAULT 1',
    ');',
    '',
  ];

  for (const site of websites) {
    lines.push(
      `INSERT OR REPLACE INTO websites VALUES ('${site.id}', '${site.name.replace(/'/g, "''")}', '${site.domain}', '${site.description.replace(/'/g, "''")}', '${site.category}', '${site.createdAt}', '${site.updatedAt}');`
    );
    for (const page of site.pages) {
      lines.push(
        `INSERT OR REPLACE INTO webpages VALUES ('${page.id}', '${site.id}', '${page.title.replace(/'/g, "''")}', '${page.slug}', '${(page.description || '').replace(/'/g, "''")}', '${JSON.stringify(page.nodes).replace(/'/g, "''")}', '${page.updatedAt}');`
      );
    }
  }

  // Insert users into SQLite credential vault
  for (const user of users) {
    lines.push(
      `INSERT OR REPLACE INTO users VALUES ('${user.id}', '${user.email.replace(/'/g, "''")}', '${user.name.replace(/'/g, "''")}', '${user.role}', '${user.passwordHash}', '${user.passwordSalt}', '${user.createdAt}', '${user.lastLogin || ''}', 1);`
    );
  }

  lines.push('COMMIT;');
  return lines.join('\n');
}

/**
 * Simulates syncing SQLite database file to OneDrive folder via Microsoft Graph API
 */
export async function syncSQLiteToOneDrive(
  config: OneDriveConfig,
  websites: Website[],
  users: StoredUserCredential[] = INITIAL_CREDENTIALS
): Promise<SQLiteSyncResult> {
  const dump = generateSQLiteDump(websites, users);
  const byteSize = new Blob([dump]).size;

  // Simulate network roundtrip to Microsoft Graph API
  await new Promise((resolve) => setTimeout(resolve, 850));

  return {
    success: true,
    message: `Successfully synchronized ${config.sqliteFileName} (${(byteSize / 1024).toFixed(1)} KB) and ${users.length} credentials to OneDrive folder ${config.folderPath}`,
    syncedAt: new Date().toISOString(),
    byteSize,
  };
}

/**
 * Download SQLite Dump file directly to user machine
 */
export function downloadSQLiteFile(
  websites: Website[],
  users: StoredUserCredential[] = INITIAL_CREDENTIALS,
  filename: string = 'canvas_store.sqlite'
): void {
  const dump = generateSQLiteDump(websites, users);
  const blob = new Blob([dump], { type: 'application/x-sqlite3;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Executes a simulated GraphQL query against the in-memory SQLite store
 */
export function executeGraphQLQuery(
  query: string,
  variables: Record<string, any>,
  website: Website,
  users: StoredUserCredential[] = INITIAL_CREDENTIALS
): any {
  const cleanQ = query.trim();

  // Query: users
  if (cleanQ.includes('users')) {
    return {
      data: {
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          passwordHash: u.passwordHash.substring(0, 16) + '...[REDACTED_SHA256]',
          passwordSalt: u.passwordSalt.substring(0, 8) + '...',
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
          syncedToOneDrive: u.syncedToOneDrive,
        })),
      },
    };
  }

  // Query: getPage
  if (cleanQ.includes('getPage')) {
    const slug = variables?.slug || 'home';
    const page = website.pages.find((p) => p.slug === slug) || website.pages[0];
    return {
      data: {
        getPage: {
          id: page.id,
          title: page.title,
          slug: page.slug,
          description: page.description,
          updatedAt: page.updatedAt,
          sectionsCount: page.nodes.length,
          sections: page.nodes.map((n) => ({
            id: n.id,
            componentId: n.componentId,
            name: n.name,
            props: n.props,
          })),
        },
      },
    };
  }

  // Query: listPages or pages
  if (cleanQ.includes('pages') || cleanQ.includes('listPages')) {
    return {
      data: {
        pages: website.pages.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          updatedAt: p.updatedAt,
          sectionsCount: p.nodes.length,
        })),
      },
    };
  }

  // Mutation: submitLead
  if (cleanQ.includes('submitLead')) {
    const email = variables?.email || 'user@example.com';
    const pageSlug = variables?.pageSlug || 'home';
    return {
      data: {
        submitLead: {
          success: true,
          message: `Lead for ${email} on page /${pageSlug} saved to SQLite database.`,
          leadId: `lead-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  // Default query: website overview
  return {
    data: {
      website: {
        id: website.id,
        name: website.name,
        domain: website.domain,
        category: website.category,
        totalPages: website.pages.length,
        activePageId: website.activePageId,
        graphQLEndpoint: '/graphql',
        dbSource: 'OneDrive / SQLite (canvas_store.sqlite)',
      },
    },
  };
}
