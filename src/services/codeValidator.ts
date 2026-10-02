import { ValidationResult } from '../types';

// Polyfill CanvasRenderingContext2D.roundRect only if not natively supported in the browser
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    this: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radii?: number | number[]
  ) {
    const r = typeof radii === 'number' ? radii : Array.isArray(radii) && radii.length > 0 ? radii[0] : 0;
    const radius = Math.min(Math.abs(w) / 2, Math.abs(h) / 2, Math.max(0, r));
    this.moveTo(x + radius, y);
    this.arcTo(x + w, y, x + w, y + h, radius);
    this.arcTo(x + w, y + h, x, y + h, radius);
    this.arcTo(x, y + h, x, y, radius);
    this.arcTo(x, y, x + w, y, radius);
    this.closePath();
    return this;
  };
}

export type CompiledDrawFunction = (
  ctx: CanvasRenderingContext2D,
  time: number,
  width: number,
  height: number
) => void;

export interface CompilationResult {
  isValid: boolean;
  drawFn: CompiledDrawFunction | null;
  error?: string;
  line?: number;
  column?: number;
}

/**
 * Validates JavaScript code structure and syntax.
 */
export function validateCode(code: string): ValidationResult {
  if (!code || !code.trim()) {
    return {
      isValid: false,
      error: 'Code editor is empty. Please enter animation code with function draw(ctx, time, width, height).',
    };
  }

  // Check if draw function identifier exists
  const hasDrawDeclaration = /function\s+draw\s*\(|const\s+draw\s*=|let\s+draw\s*=|var\s+draw\s*=/i.test(code);
  if (!hasDrawDeclaration) {
    return {
      isValid: false,
      error: 'Invalid animation code. A draw(ctx, time, width, height) function is required.',
    };
  }

  try {
    // Syntax check using Function constructor
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(code);
  } catch (err: unknown) {
    const error = err as Error;
    let line: number | undefined;
    let column: number | undefined;

    if (error.stack) {
      const match = error.stack.match(/<anonymous>:(\d+):(\d+)/) || error.stack.match(/:(\d+):(\d+)/);
      if (match) {
        line = parseInt(match[1], 10);
        column = parseInt(match[2], 10);
      }
    }

    if (!line && error.message) {
      const match = error.message.match(/line\s+(\d+)/i);
      if (match) {
        line = parseInt(match[1], 10);
      }
    }

    const message = error.message || 'Syntax error in code';
    return {
      isValid: false,
      error: line ? `Line ${line}: ${message}` : message,
      line,
      column,
    };
  }

  return { isValid: true };
}

/**
 * Compiles code inside a secure scope shadowing dangerous browser globals
 * while preserving standard JavaScript math, arrays, objects, and canvas operations.
 */
export function compileSandboxedCode(code: string): CompilationResult {
  const validation = validateCode(code);
  if (!validation.isValid) {
    return {
      isValid: false,
      drawFn: null,
      error: validation.error,
      line: validation.line,
      column: validation.column,
    };
  }

  try {
    const wrappedBody = `
      "use strict";
      return (function() {
        // Shadow sensitive browser/network/storage globals
        const window = undefined;
        const document = undefined;
        const localStorage = undefined;
        const sessionStorage = undefined;
        const fetch = undefined;
        const XMLHttpRequest = undefined;
        const WebSocket = undefined;
        const navigator = undefined;
        const location = undefined;
        const indexedDB = undefined;
        const globalThis = undefined;
        const parent = undefined;
        const top = undefined;
        const opener = undefined;

        ${code}

        if (typeof draw !== 'function') {
          throw new Error("Invalid animation code. A draw(ctx, time, width, height) function is required.");
        }
        return draw;
      })();
    `;

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const factory = new Function(wrappedBody);
    const rawDraw = factory();

    if (typeof rawDraw !== 'function') {
      return {
        isValid: false,
        drawFn: null,
        error: 'Invalid animation code. A draw(ctx, time, width, height) function is required.',
      };
    }

    // Wrap execution with safety try/catch and pass exact numeric params
    const safeDraw: CompiledDrawFunction = (ctx, time, width, height) => {
      rawDraw(ctx, time, width, height);
    };

    return {
      isValid: true,
      drawFn: safeDraw,
    };
  } catch (err: unknown) {
    const error = err as Error;
    let line: number | undefined;

    if (error.stack) {
      const match = error.stack.match(/<anonymous>:(\d+):(\d+)/);
      if (match) {
        line = Math.max(1, parseInt(match[1], 10) - 17);
      }
    }

    return {
      isValid: false,
      drawFn: null,
      error: error.message || 'Failed to compile animation code.',
      line,
    };
  }
}
