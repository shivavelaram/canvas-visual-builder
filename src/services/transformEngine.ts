import { Transform, TransformStep } from '../types/canvas';

export interface TransformStepTrace {
  stepIndex: number;
  op: string;
  input: any;
  output: any;
  durationMs: number;
  error?: string;
}

export interface TransformExecutionResult {
  success: boolean;
  output: any;
  traces: TransformStepTrace[];
  error?: string;
}

/**
 * Safely extracts nested values from an object or array via dot/bracket notation.
 * e.g. "orders[]", "customer.name", "items[0].sku"
 */
export function safeExtractPath(data: any, path: string): any {
  if (data === null || data === undefined) return undefined;
  if (!path || path === '.' || path === '') return data;

  const parts = path.split('.').filter(Boolean);
  let current: any = data;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Check for array indicator e.g. "items[]" or "items[0]"
    if (part.endsWith('[]')) {
      const prop = part.slice(0, -2);
      const arr = prop ? current[prop] : current;
      if (!Array.isArray(arr)) return undefined;

      // If there are more path parts, map over elements
      const remainingPath = parts.slice(i + 1).join('.');
      if (remainingPath) {
        return arr.map((item) => safeExtractPath(item, remainingPath)).filter((x) => x !== undefined);
      }
      return arr;
    }

    const indexMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (indexMatch) {
      const prop = indexMatch[1];
      const index = parseInt(indexMatch[2], 10);
      if (current[prop] && Array.isArray(current[prop])) {
        current = current[prop][index];
      } else {
        return undefined;
      }
    } else {
      if (typeof current !== 'object' || current === null) return undefined;
      current = current[part];
    }

    if (current === undefined || current === null) return current;
  }

  return current;
}

/**
 * Pure, deterministic sandboxed operator evaluator.
 * Never executes arbitrary JS or invokes eval/Function.
 */
export function executeOperator(op: string, input: any, params: Record<string, any>): any {
  switch (op) {
    case 'extractPath': {
      const path = params.path || '';
      return safeExtractPath(input, path);
    }

    case 'flatten': {
      if (!Array.isArray(input)) return [input];
      const depth = typeof params.depth === 'number' ? params.depth : 1;
      return input.flat(depth);
    }

    case 'trim': {
      if (typeof input === 'string') return input.trim();
      if (Array.isArray(input)) return input.map((item) => (typeof item === 'string' ? item.trim() : item));
      return input;
    }

    case 'format': {
      const formatType = params.type || 'none';
      if (input === null || input === undefined) return '';

      switch (formatType) {
        case 'currency': {
          const num = typeof input === 'number' ? input : parseFloat(String(input));
          if (isNaN(num)) return input;
          const currency = params.currency || 'USD';
          const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
          return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        case 'date': {
          try {
            const date = new Date(input);
            if (isNaN(date.getTime())) return String(input);
            const style = params.style || 'short';
            if (style === 'relative') {
              return 'Just now';
            }
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          } catch {
            return String(input);
          }
        }
        case 'percentage': {
          const num = typeof input === 'number' ? input : parseFloat(String(input));
          if (isNaN(num)) return input;
          const pct = num <= 1 && num >= -1 && params.treatDecimals ? num * 100 : num;
          return `${pct > 0 && params.showPlus ? '+' : ''}${pct.toFixed(1)}%`;
        }
        case 'uppercase': {
          return String(input).toUpperCase();
        }
        case 'lowercase': {
          return String(input).toLowerCase();
        }
        default:
          return input;
      }
    }

    case 'default': {
      const fallback = params.fallback !== undefined ? params.fallback : '';
      if (input === null || input === undefined || input === '' || (Array.isArray(input) && input.length === 0)) {
        return fallback;
      }
      return input;
    }

    case 'rename': {
      const mapping = params.mapping || {}; // e.g. { "cust_name": "customerName" }
      if (Array.isArray(input)) {
        return input.map((row) => {
          if (typeof row !== 'object' || row === null) return row;
          const newRow: Record<string, any> = { ...row };
          for (const [oldKey, newKey] of Object.entries(mapping)) {
            if (oldKey in newRow) {
              newRow[newKey as string] = newRow[oldKey];
              delete newRow[oldKey];
            }
          }
          return newRow;
        });
      }
      if (typeof input === 'object' && input !== null) {
        const newObj: Record<string, any> = { ...input };
        for (const [oldKey, newKey] of Object.entries(mapping)) {
          if (oldKey in newObj) {
            newObj[newKey as string] = newObj[oldKey];
            delete newObj[oldKey];
          }
        }
        return newObj;
      }
      return input;
    }

    case 'filter': {
      if (!Array.isArray(input)) return input;
      const field = params.field;
      const opType = params.comparator || 'equals'; // 'equals' | 'not_equals' | 'greater_than' | 'contains'
      const targetVal = params.value;

      return input.filter((item) => {
        const val = field ? safeExtractPath(item, field) : item;
        switch (opType) {
          case 'equals':
            return val == targetVal;
          case 'not_equals':
            return val != targetVal;
          case 'greater_than':
            return Number(val) > Number(targetVal);
          case 'less_than':
            return Number(val) < Number(targetVal);
          case 'contains':
            return String(val).toLowerCase().includes(String(targetVal).toLowerCase());
          case 'truthy':
            return Boolean(val);
          default:
            return true;
        }
      });
    }

    case 'join': {
      if (!Array.isArray(input)) return String(input);
      const delimiter = params.delimiter !== undefined ? params.delimiter : ', ';
      return input.filter((x) => x !== null && x !== undefined).join(delimiter);
    }

    case 'split': {
      if (typeof input !== 'string') return [input];
      const delimiter = params.delimiter !== undefined ? params.delimiter : ',';
      return input.split(delimiter).map((s) => s.trim());
    }

    case 'map': {
      if (!Array.isArray(input)) return input;
      const subOp = params.subOp; // e.g. { op: 'extractPath', params: { path: 'sku' } }
      if (subOp && subOp.op) {
        return input.map((item) => executeOperator(subOp.op, item, subOp.params || {}));
      }
      const field = params.field;
      if (field) {
        return input.map((item) => safeExtractPath(item, field));
      }
      return input;
    }

    case 'conditionalSelect': {
      // e.g. if > threshold then 'high' else 'normal'
      const condition = params.condition || 'equals';
      const compareValue = params.compareValue;
      const trueValue = params.trueValue;
      const falseValue = params.falseValue;

      let isMatch = false;
      switch (condition) {
        case 'greater_than':
          isMatch = Number(input) > Number(compareValue);
          break;
        case 'less_than':
          isMatch = Number(input) < Number(compareValue);
          break;
        case 'equals':
          isMatch = input == compareValue;
          break;
        case 'truthy':
          isMatch = Boolean(input);
          break;
        default:
          isMatch = false;
      }
      return isMatch ? trueValue : falseValue;
    }

    default:
      return input;
  }
}

/**
 * Pure transform runner that runs a chain of steps with bounded iteration and returns traces.
 */
export function runTransform(transform: Transform | { steps: TransformStep[] }, rawInput: any): TransformExecutionResult {
  const traces: TransformStepTrace[] = [];
  let currentVal = rawInput;

  try {
    for (let i = 0; i < transform.steps.length; i++) {
      const step = transform.steps[i];
      const start = performance.now();
      const stepInput = currentVal;
      currentVal = executeOperator(step.op, currentVal, step.params);
      const end = performance.now();

      traces.push({
        stepIndex: i,
        op: step.op,
        input: stepInput,
        output: currentVal,
        durationMs: Math.max(0.01, end - start),
      });
    }

    return {
      success: true,
      output: currentVal,
      traces,
    };
  } catch (err: any) {
    return {
      success: false,
      output: currentVal,
      traces,
      error: err?.message || 'Unknown transformation error',
    };
  }
}
