import { CanvasNode, ComponentDef, DataModel, Transform, PropDefinition } from '../types/canvas';

export interface ValidationIssue {
  nodeId: string;
  componentName: string;
  propKey: string;
  severity: 'error' | 'warning';
  message: string;
  resolutionHint: string;
}

export interface PublishValidationReport {
  canPublish: boolean;
  totalNodes: number;
  totalBoundProps: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

/**
 * Validates a single prop against its contract schema definition and bound data.
 */
export function validatePropContract(
  propDef: PropDefinition,
  propValue: any,
  propKey: string,
  nodeName: string,
  nodeId: string
): ValidationIssue | null {
  // Check required
  if (propDef.required && (propValue === undefined || propValue === null || propValue === '')) {
    return {
      nodeId,
      componentName: nodeName,
      propKey,
      severity: 'error',
      message: `Required prop "${propKey}" is not bound or has empty value.`,
      resolutionHint: `Bind "${propKey}" to a data field or provide a static default value.`,
    };
  }

  if (propValue === undefined || propValue === null) {
    return null;
  }

  // Type check
  const actualType = Array.isArray(propValue) ? 'array' : typeof propValue;
  if (propDef.type === 'array' && !Array.isArray(propValue)) {
    return {
      nodeId,
      componentName: nodeName,
      propKey,
      severity: 'error',
      message: `Prop "${propKey}" expects an array, but received ${actualType}.`,
      resolutionHint: `Select an array field (e.g. "items[]") or attach an extraction transform.`,
    };
  }

  if (propDef.type === 'number' && typeof propValue !== 'number') {
    const parsed = Number(propValue);
    if (isNaN(parsed)) {
      return {
        nodeId,
        componentName: nodeName,
        propKey,
        severity: 'warning',
        message: `Prop "${propKey}" expects a number, but received non-numeric string "${propValue}".`,
        resolutionHint: `Add a format or parse transform to convert to a numeric value.`,
      };
    }
  }

  if (propDef.options && propDef.options.length > 0) {
    if (!propDef.options.includes(String(propValue))) {
      return {
        nodeId,
        componentName: nodeName,
        propKey,
        severity: 'warning',
        message: `Value "${propValue}" is not in allowlisted options: [${propDef.options.join(', ')}].`,
        resolutionHint: `Choose one of the accepted options or add a conditionalSelect transform.`,
      };
    }
  }

  return null;
}

/**
 * Recursively validates an entire layout tree against allowlisted component schemas.
 */
export function validatePageTreeForPublish(
  nodes: CanvasNode[],
  componentRegistry: Record<string, ComponentDef>,
  dataModels: Record<string, DataModel>,
  resolvedDataByNode: Record<string, Record<string, any>> = {}
): PublishValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  let totalNodes = 0;
  let totalBoundProps = 0;

  function traverse(node: CanvasNode) {
    totalNodes++;
    const compDef = componentRegistry[node.componentId];

    if (!compDef) {
      errors.push({
        nodeId: node.id,
        componentName: node.componentId,
        propKey: '*',
        severity: 'error',
        message: `Component "${node.componentId}" is not registered or not in the allowlist.`,
        resolutionHint: 'Replace this node with an allowlisted component from the registry.',
      });
      return;
    }

    // Check bindings & props
    const resolvedProps = resolvedDataByNode[node.id] || node.props || {};

    for (const [propKey, propDef] of Object.entries(compDef.prop_schema)) {
      const isBound = Boolean(node.bindings && node.bindings[propKey]);
      if (isBound) totalBoundProps++;

      const val = resolvedProps[propKey];
      const issue = validatePropContract(propDef, val, propKey, compDef.name, node.id);
      if (issue) {
        if (issue.severity === 'error') {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      }
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);

  return {
    canPublish: errors.length === 0,
    totalNodes,
    totalBoundProps,
    errors,
    warnings,
  };
}
