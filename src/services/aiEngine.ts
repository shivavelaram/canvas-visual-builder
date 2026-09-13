import { AIJob, CanvasNode, ComponentDef, DataModel, Transform, DataBinding } from '../types/canvas';

/**
 * Redacts secrets, tokens, and PII before prompting or recording.
 */
export function redactSensitiveContext(input: any): any {
  if (typeof input === 'string') {
    return input.replace(/([a-zA-Z0-9_-]{24,})/g, '[REDACTED_SECRET]');
  }
  if (Array.isArray(input)) {
    return input.map(redactSensitiveContext);
  }
  if (typeof input === 'object' && input !== null) {
    const copy: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (/password|secret|token|apikey|key|auth|bearer/i.test(k)) {
        copy[k] = '[REDACTED_SECRET]';
      } else {
        copy[k] = redactSensitiveContext(v);
      }
    }
    return copy;
  }
  return input;
}

/**
 * Simulates the AI Assistant Engine generating structured, validated proposals
 * conforming to Section 12 with confidence scoring and diffs.
 */
export function generateAIProposal(
  kind: 'layout-gen' | 'mapping-suggest' | 'transform-draft' | 'schema-gen' | 'explain',
  userPrompt: string,
  context: {
    currentNodes: CanvasNode[];
    componentRegistry: Record<string, ComponentDef>;
    dataModels: Record<string, DataModel>;
    selectedNodeId?: string;
  }
): AIJob {
  const sanitizedPrompt = redactSensitiveContext(userPrompt);
  const jobId = `ai-job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  if (kind === 'layout-gen' || userPrompt.toLowerCase().includes('dashboard') || userPrompt.toLowerCase().includes('layout')) {
    // Generate e-commerce / operations dashboard layout proposal
    const proposedNodes: CanvasNode[] = [
      {
        id: `node-${Date.now()}-1`,
        componentId: 'section_header',
        name: 'Executive Summary Header',
        variant: 'default',
        props: {
          title: 'Store Operations & Revenue Command',
          subtitle: 'Live synchronized feeds from Postgres SQL & Stripe Payments API',
          badgeText: 'LIVE REPLICATED',
        },
      },
      {
        id: `node-${Date.now()}-2`,
        componentId: 'kpi_grid_section',
        name: 'Metric Cards Trio',
        variant: 'three_col',
        props: {},
        children: [
          {
            id: `node-${Date.now()}-2a`,
            componentId: 'metric_card',
            name: 'Total Revenue KPI',
            variant: 'highlighted',
            props: {
              title: 'Gross Revenue (Q3)',
              value: '$148,290.00',
              trend: '+18.4%',
              subtitle: 'vs. prior 30d window',
              tone: 'positive',
            },
            bindings: {
              value: { modelId: 'orders_v3', fieldPath: 'total', transformId: 'tr_currency_usd' },
            },
          },
          {
            id: `node-${Date.now()}-2b`,
            componentId: 'metric_card',
            name: 'Active Orders KPI',
            variant: 'default',
            props: {
              title: 'Fulfilled Orders',
              value: '1,429',
              trend: '+5.2%',
              subtitle: '99.4% on-time dispatch',
              tone: 'positive',
            },
            bindings: {
              value: { modelId: 'orders_v3', fieldPath: 'id' },
            },
          },
          {
            id: `node-${Date.now()}-2c`,
            componentId: 'metric_card',
            name: 'Average Order Value',
            variant: 'default',
            props: {
              title: 'Avg Order Value (AOV)',
              value: '$103.77',
              trend: '-1.8%',
              subtitle: 'Target: $110.00',
              tone: 'neutral',
            },
            bindings: {
              value: { modelId: 'orders_v3', fieldPath: 'total' },
            },
          },
        ],
      },
      {
        id: `node-${Date.now()}-3`,
        componentId: 'data_table',
        name: 'Live Orders Stream Table',
        variant: 'striped',
        props: {
          title: 'Recent Transactions & Fulfillment',
          columns: ['Order ID', 'Customer', 'Items Count', 'Status', 'Total'],
          pageSize: 5,
        },
        bindings: {
          items: { modelId: 'orders_v3', fieldPath: 'orders[]' },
        },
      },
      {
        id: `node-${Date.now()}-4`,
        componentId: 'alert_banner',
        name: 'Inventory Restock Callout',
        variant: 'warning',
        props: {
          title: '3 SKUs Low in Stock',
          message: 'Threshold alert triggered: SKU-904, SKU-812 and SKU-401 are below reorder level (10 units).',
          dismissible: true,
        },
      },
    ];

    return {
      id: jobId,
      tenant_id: 'tenant-apex-1',
      kind: 'layout-gen',
      prompt: sanitizedPrompt,
      confidence: 0.94,
      status: 'pending_review',
      created_at: new Date().toISOString(),
      created_by: 'Alex Rivera (Builder)',
      proposal: {
        title: 'Executive Store Operations Dashboard Layout',
        rationale: 'Derived from active `orders_v3` data model and allowlisted `metric_card` & `data_table` components. Includes KPI summary grid, live transaction table, and threshold alert banner.',
        confidence_breakdown: {
          schema_match: 0.98,
          prop_coverage: 0.92,
          structural_fit: 0.95,
        },
        changes: {
          type: 'layout_patch',
          description: 'Adds 4 top-level structured nodes: Section Header, 3-Column KPI Grid with bound revenue metrics, Live Orders Data Table, and Restock Banner.',
          diffNodes: proposedNodes,
        },
      },
    };
  }

  if (kind === 'mapping-suggest') {
    // Generate mapping suggestion for selected node or active table
    const proposedBindings: Record<string, DataBinding> = {
      title: { modelId: 'orders_v3', fieldPath: 'customer.name' },
      value: { modelId: 'orders_v3', fieldPath: 'total', transformId: 'tr_currency_usd' },
      trend: { modelId: 'orders_v3', fieldPath: 'growth_pct', transformId: 'tr_pct_format' },
      status: { modelId: 'orders_v3', fieldPath: 'fulfillment_status' },
    };

    return {
      id: jobId,
      tenant_id: 'tenant-apex-1',
      kind: 'mapping-suggest',
      prompt: sanitizedPrompt,
      confidence: 0.96,
      status: 'pending_review',
      created_at: new Date().toISOString(),
      created_by: 'Alex Rivera (Builder)',
      proposal: {
        title: 'Auto-Map Order Schema to Component Props',
        rationale: 'Analyzed `orders_v3` fields against Component prop contract. Mapped currency total to `value` with safe `tr_currency_usd` transform, and customer name to `title`.',
        confidence_breakdown: {
          schema_match: 0.99,
          prop_coverage: 0.95,
          structural_fit: 0.94,
        },
        changes: {
          type: 'mapping_patch',
          description: 'Updates 4 field bindings on the target component, automatically pairing currency formatting to the total amount.',
          diffBindings: proposedBindings,
        },
      },
    };
  }

  // Default: transform-draft
  const newTransform: Transform = {
    id: `tr_ai_${Date.now()}`,
    tenant_id: 'tenant-apex-1',
    name: 'Currency & Tax Formatter Pipeline',
    description: 'Deterministic 3-step pipeline: extract total, format as USD currency, fallback to $0.00',
    input_schema_ref: 'orders_v3',
    output_type: 'string',
    steps: [
      { op: 'extractPath', params: { path: 'total' } },
      { op: 'format', params: { type: 'currency', currency: 'USD' } },
      { op: 'default', params: { fallback: '$0.00' } },
    ],
  };

  return {
    id: jobId,
    tenant_id: 'tenant-apex-1',
    kind: 'transform-draft',
    prompt: sanitizedPrompt,
    confidence: 0.98,
    status: 'pending_review',
    created_at: new Date().toISOString(),
    created_by: 'Alex Rivera (Builder)',
    proposal: {
      title: 'Deterministic Currency Pipeline',
      rationale: 'Generates a pure 3-step operator chain: `extractPath("total")` -> `format(currency="USD")` -> `default("$0.00")`. Evaluated safely with 0 arbitrary code execution.',
      confidence_breakdown: {
        schema_match: 1.0,
        prop_coverage: 0.96,
        structural_fit: 0.98,
      },
      changes: {
        type: 'transform_patch',
        description: 'Registers a reusable deterministic transform `Currency & Tax Formatter Pipeline` ready for binding.',
        newTransform,
      },
    },
  };
}
