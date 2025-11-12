import * as vm from 'vm';
import { ExecutionResult, SandboxConfig } from '../types';

/**
 * Secure sandbox for executing untrusted code
 * Uses Node.js vm module for sandboxing
 *
 * Note: For production use with untrusted code, consider additional security measures
 * such as running in a separate process or container.
 */
export class Sandbox {
  private config: SandboxConfig;

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = {
      timeout: config.timeout || 5000, // 5 seconds default
      memoryLimit: config.memoryLimit || 128, // 128MB default
      allowNetworkAccess: config.allowNetworkAccess ?? false,
      allowFileSystemAccess: config.allowFileSystemAccess ?? false,
      allowedModules: config.allowedModules || [],
      maxCpuTime: config.maxCpuTime || 10000, // 10 seconds default
    };
  }

  /**
   * Execute code in the sandbox
   */
  async execute<T = any>(code: string, context: Record<string, any> = {}): Promise<ExecutionResult<T>> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      // Create sandbox context
      const sandbox: any = {
        ...context,
        console: {
          log: (...args: any[]) => console.log('[Sandbox]:', ...args),
          error: (...args: any[]) => console.error('[Sandbox ERROR]:', ...args),
          warn: (...args: any[]) => console.warn('[Sandbox WARN]:', ...args),
        },
        setTimeout: undefined,
        setInterval: undefined,
        setImmediate: undefined,
        process: undefined,
        require: undefined,
        __dirname: undefined,
        __filename: undefined,
        module: undefined,
        exports: undefined,
        Promise,
      };

      // Inject allowed modules
      for (const moduleName of this.config.allowedModules) {
        if (moduleName === 'Math') {
          sandbox.Math = Math;
        } else if (moduleName === 'JSON') {
          sandbox.JSON = JSON;
        } else if (moduleName === 'Date') {
          sandbox.Date = Date;
        }
      }

      // Create VM context
      const vmContext = vm.createContext(sandbox);

      // Wrap code in async function
      const wrappedCode = `
        (async () => {
          ${code}
        })()
      `;

      // Execute with timeout
      const result = await this.executeWithTimeout<T>(wrappedCode, vmContext);

      const executionTime = Date.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;

      return {
        success: true,
        data: result,
        stats: {
          executionTime,
          memoryUsed,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          code: this.getErrorCode(error),
        },
        stats: {
          executionTime,
          memoryUsed,
        },
      };
    }
  }

  /**
   * Execute code with timeout
   */
  private async executeWithTimeout<T>(code: string, context: vm.Context): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Execution timeout exceeded'));
      }, this.config.timeout);

      try {
        const script = new vm.Script(code);
        const result = script.runInContext(context, {
          timeout: this.config.timeout,
        });

        // Handle promise result
        if (result && typeof result.then === 'function') {
          result
            .then((value: T) => {
              clearTimeout(timeoutId);
              resolve(value);
            })
            .catch((error: Error) => {
              clearTimeout(timeoutId);
              reject(error);
            });
        } else {
          clearTimeout(timeoutId);
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Get error code from error
   */
  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return 'TIMEOUT';
      }
      if (error.message.includes('memory')) {
        return 'MEMORY_LIMIT';
      }
      if (error.message.includes('CPU')) {
        return 'CPU_LIMIT';
      }
    }
    return 'EXECUTION_ERROR';
  }

  /**
   * Update sandbox configuration
   */
  updateConfig(config: Partial<SandboxConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SandboxConfig {
    return { ...this.config };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    // No resources to dispose with vm module
  }
}

/**
 * Execute code with default sandbox settings
 */
export async function executeInSandbox<T = any>(
  code: string,
  context?: Record<string, any>,
  config?: Partial<SandboxConfig>,
): Promise<ExecutionResult<T>> {
  const sandbox = new Sandbox(config);
  try {
    return await sandbox.execute<T>(code, context);
  } finally {
    sandbox.dispose();
  }
}
