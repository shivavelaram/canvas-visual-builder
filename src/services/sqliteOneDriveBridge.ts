import { Website, Webpage, OneDriveConfig } from '../types/canvas';

export interface SQLiteSyncResult {
  success: boolean;
  message: string;
  syncedAt: string;
  byteSize: number;
}

export const INITIAL_ONEDRIVE_CONFIG: OneDriveConfig = {
  isConnected: false,
  userEmail: 'admin@apexcloud.io',
  folderPath: '/OneDrive/Apps/CanvasStudio/db/',
  sqliteFileName: 'canvas_store.sqlite',
  lastSyncedAt: undefined,
  syncStatus: 'idle',
  autoSync: true,
  clientId: 'app-canvas-studio-enterprise',
  dbSizeBytes: 42800,
};

/**
 * Generates an SQL dump string for SQLite representing all websites and pages
 */
export function generateSQLiteDump(websites: Website[]): string {
  const lines: string[] = [
    '-- SQLite Database Dump',
    `-- Dumped at: ${new Date().toISOString()}`,
    'PRAGMA foreign_keys=OFF;',
    'BEGIN TRANSACTION;',
    '',
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
    'CREATE TABLE IF NOT EXISTS dynamic_leads (',
    '  id TEXT PRIMARY KEY,',
    '  email TEXT NOT NULL,',
    '  page_slug TEXT,',
    '  created_at TEXT',
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

  lines.push('COMMIT;');
  return lines.join('\n');
}

/**
 * Simulates syncing SQLite database file to OneDrive folder via Microsoft Graph API
 */
export async function syncSQLiteToOneDrive(
  config: OneDriveConfig,
  websites: Website[]
): Promise<SQLiteSyncResult> {
  const dump = generateSQLiteDump(websites);
  const byteSize = new Blob([dump]).size;

  // Simulate network roundtrip to Microsoft Graph API
  await new Promise((resolve) => setTimeout(resolve, 850));

  return {
    success: true,
    message: `Successfully synchronized ${config.sqliteFileName} (${(byteSize / 1024).toFixed(1)} KB) to ${config.folderPath}`,
    syncedAt: new Date().toISOString(),
    byteSize,
  };
}

/**
 * Download SQLite Dump file directly to user machine
 */
export function downloadSQLiteFile(websites: Website[], filename: string = 'canvas_store.sqlite'): void {
  const dump = generateSQLiteDump(websites);
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
  website: Website
): any {
  const cleanQ = query.trim();

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
