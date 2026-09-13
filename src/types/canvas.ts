export type TaxonomyLevel = 'atom' | 'molecule' | 'organism' | 'section' | 'template' | 'page';

export type Environment = 'development' | 'staging' | 'production';

export type UserRole = 'Platform Admin' | 'Data Engineer' | 'Frontend Engineer' | 'Builder / No-code' | 'Auditor / Compliance';

export interface Tenant {
  id: string;
  name: string;
  plan_id: 'Starter' | 'Enterprise Pro' | 'Custom';
  region: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  tenant_id: string;
  name: string;
  active_environment: Environment;
  created_at: string;
}

export interface PropDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  description?: string;
  options?: string[];
  default?: any;
}

export interface ComponentDef {
  id: string;
  name: string;
  taxonomy_level: TaxonomyLevel;
  semver: string;
  icon: string;
  description: string;
  prop_schema: Record<string, PropDefinition>;
  variants: string[];
  slots: string[];
  is_allowlisted: boolean;
}

export interface DataBinding {
  modelId: string;
  fieldPath: string;
  transformId?: string;
}

export interface CanvasNode {
  id: string;
  componentId: string;
  variant?: string;
  name?: string;
  props: Record<string, any>;
  bindings?: Record<string, DataBinding>;
  children?: CanvasNode[];
}

export interface DataModelField {
  path: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  format?: 'currency' | 'date' | 'percentage' | 'email' | 'url' | 'none';
  required?: boolean;
  sampleValue?: any;
}

export interface DataModel {
  id: string;
  tenant_id: string;
  name: string;
  version_number: number;
  source_type: 'sql' | 'nosql' | 'rest' | 'graphql' | 'json' | 'manual';
  connector_id: string;
  fields: DataModelField[];
  immutable_after_publish: boolean;
  created_at: string;
}

export interface Connector {
  id: string;
  tenant_id: string;
  type: 'sql' | 'rest' | 'graphql' | 'nosql';
  name: string;
  auth_strategy: 'api_key' | 'oauth2' | 'bearer' | 'basic' | 'custom_header';
  secret_ref: string;
  sync_mode: 'on_demand' | 'scheduled' | 'webhook';
  schedule_cron?: string;
  status: 'connected' | 'error' | 'syncing';
  latency_ms: number;
  last_sync_at: string;
  endpoint_or_host: string;
  sample_data: any;
}

export type TransformOp =
  | 'extractPath'
  | 'map'
  | 'filter'
  | 'rename'
  | 'format'
  | 'default'
  | 'join'
  | 'split'
  | 'conditionalSelect'
  | 'flatten'
  | 'trim';

export interface TransformStep {
  op: TransformOp;
  params: Record<string, any>;
}

export interface Transform {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  input_schema_ref: string;
  output_type: string;
  steps: TransformStep[];
}

export interface AIJob {
  id: string;
  tenant_id: string;
  kind: 'layout-gen' | 'mapping-suggest' | 'transform-draft' | 'schema-gen' | 'explain';
  prompt: string;
  confidence: number;
  status: 'pending_review' | 'accepted' | 'rejected' | 'failed';
  proposal: {
    title: string;
    rationale: string;
    confidence_breakdown: {
      schema_match: number;
      prop_coverage: number;
      structural_fit: number;
    };
    changes: {
      type: 'layout_patch' | 'mapping_patch' | 'transform_patch';
      description: string;
      diffNodes?: CanvasNode[];
      diffBindings?: Record<string, DataBinding>;
      newTransform?: Transform;
    };
  };
  created_at: string;
  created_by: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export interface PageVersion {
  id: string;
  page_id: string;
  version_number: string;
  status: 'draft' | 'in_review' | 'published' | 'archived';
  layout_tree: CanvasNode[];
  created_by: string;
  created_at: string;
  published_at?: string;
  published_by?: string;
  changelog?: string;
  cdn_artifact_hash?: string;
}

export interface AuditRecord {
  id: string;
  tenant_id: string;
  actor_type: 'user' | 'system' | 'ai';
  actor_name: string;
  action: string;
  entity_type: 'page' | 'component' | 'data_model' | 'connector' | 'transform' | 'ai_job' | 'version';
  entity_id: string;
  summary: string;
  before_json?: any;
  after_json?: any;
  created_at: string;
  reviewed_by?: string;
}

// -------------------------------------------------------------
// Multi-Website, Webpage & Persistence Types
// -------------------------------------------------------------

export interface NavigationMenuItem {
  id: string;
  label: string;
  pageId?: string; // target webpage ID inside this website
  slug?: string; // route slug (e.g. 'home', 'pricing', 'about', 'services', 'contact')
  externalUrl?: string; // or external link
  order: number;
  isVisible: boolean;
}

export interface ProjectGrant {
  userId: string;
  userEmail: string;
  role: 'owner' | 'editor' | 'viewer';
  grantedAt: string;
}

export interface Webpage {
  id: string;
  websiteId: string;
  title: string;
  slug: string; // e.g. "home", "pricing", "about", "features", "contact"
  description?: string;
  nodes: CanvasNode[];
  updatedAt: string;
  isPublished?: boolean;
}

export interface Website {
  id: string;
  name: string;
  domain: string;
  description: string;
  category: 'saas' | 'portfolio' | 'ecommerce' | 'documentation' | 'corporate' | 'agency' | 'custom';
  pages: Webpage[];
  activePageId: string;
  createdAt: string;
  updatedAt: string;
  // Project-specific OneDrive folder & access control
  ownerId?: string;
  ownerEmail?: string;
  oneDriveFolder?: string; // e.g. "/Apps/CanvasStudio/Projects/apex-saas/"
  grants?: ProjectGrant[]; // RBAC project grants
  menuItems?: NavigationMenuItem[]; // Header & navigation menu items linking the pages
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
  token?: string;
}

export interface StoredUserCredential {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  passwordHash: string; // Cryptographic SHA-256 hash
  passwordSalt: string; // Unique cryptographic salt per user
  createdAt: string;
  lastLogin?: string;
  syncedToOneDrive: boolean;
  oneDrivePath?: string;
  projectGrants?: string[]; // IDs of websites the user has grant access to
}

export interface OneDriveConfig {
  isConnected: boolean;
  userEmail?: string;
  folderPath: string; // e.g. "/Apps/CanvasStudio/data/"
  sqliteFileName: string; // e.g. "canvas_store.sqlite"
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  autoSync: boolean;
  clientId?: string;
  tenantId?: string;
  accessToken?: string;
  dbSizeBytes?: number;
}

export interface GraphQLConfig {
  endpoint: string;
  schemaDefinition: string;
  activeQueries: number;
  lastTestedAt?: string;
}

export interface WebBundleExportOptions {
  includeSQLite: boolean;
  includeGraphQLServer: boolean;
  port: number;
  targetEnv: 'nodejs_standalone' | 'docker' | 'static_only';
  bundleMode?: 'static_only' | 'dynamic_nodejs_sqlite' | 'dynamic_graphql_fullstack';
}

