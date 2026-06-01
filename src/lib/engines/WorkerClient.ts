import { WorkerRequestSchema, WorkerResponseSchema, WorkerAction, WorkerRequest, WorkerResponse } from './workerSchemas';
import { z } from 'zod';

type ResolveReject = { resolve: (v: any) => void; reject: (e: any) => void };

/**
 * WorkerClient: typed adapter for communicating with physics workers.
 * - Does not instantiate workers (DI-friendly)
 * - Validates request/response payloads using Zod
 */
export class WorkerClient {
  private worker: Worker | null;
  private pending = new Map<string, ResolveReject>();
  private timeoutMs: number;

  constructor(worker: Worker | null = null, opts?: { timeoutMs?: number }) {
    this.worker = worker;
    this.timeoutMs = opts?.timeoutMs ?? 5000;

    if (this.worker) this.bind();
  }

  public setWorker(worker: Worker) {
    if (this.worker) this.unbind();
    this.worker = worker;
    this.bind();
  }

  private bind() {
    if (!this.worker) return;
    this.worker.addEventListener('message', (ev: MessageEvent) => {
      try {
        const parsed = WorkerResponseSchema.parse(ev.data);
        const entry = this.pending.get(parsed.id);
        if (entry) {
          entry.resolve(parsed.result);
          this.pending.delete(parsed.id);
        }
      } catch (e) {
        // ignore invalid worker message
        console.warn('[WorkerClient] invalid worker response', e);
      }
    });
  }

  private unbind() {
    if (!this.worker) return;
    // best-effort: remove handlers by cloning worker (no reliable removeEventListener here)
    // Consumers should create a fresh WorkerClient when swapping workers in complex setups.
    this.worker = null;
    this.pending.clear();
  }

  public async run(type: z.infer<typeof WorkerAction>, payload: any): Promise<any> {
    const id = crypto.randomUUID();

    // Validate request structure
    const req = { id, type, payload };
    WorkerRequestSchema.parse(req);

    if (!this.worker) {
      return Promise.reject(new Error('No worker available'));
    }

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker!.postMessage(req);

      const to = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('Worker request timeout'));
        }
      }, this.timeoutMs);

      // clear timeout when resolved/rejected
      const wrappedResolve = (v: any) => { clearTimeout(to); resolve(v); };
      const wrappedReject = (e: any) => { clearTimeout(to); reject(e); };
      this.pending.set(id, { resolve: wrappedResolve, reject: wrappedReject });
    });
  }

  // Lightweight convenience methods for common actions
  public calculateEfficiency(head: number, flow: number, bucketHours?: number) {
    return this.run('CALCULATE_EFFICIENCY', { head, flow, bucketHours });
  }

  public calculateCavitation(npsh: number, head: number) {
    return this.run('CALCULATE_CAVITATION', { npsh, head });
  }

  public calculateWaterHammer(waveSpeed: number, deltaV: number) {
    return this.run('CALCULATE_WATER_HAMMER', { waveSpeed, deltaV });
  }
}

export default WorkerClient;
