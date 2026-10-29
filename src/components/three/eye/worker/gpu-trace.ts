/**
 * Diagnostics (lab, ?trace): times every synchronous WebGPU pipeline and shader-module creation
 * on this thread (main or worker). A sync pipeline compiles on the GPU
 * process's main thread, and every frame in the browser waits for it.
 */

export type GpuCall = { what: string; at: number; ms: number; label?: string };

export const gpuLog: GpuCall[] = [];

export function traceGpu() {
  const D = (globalThis as { GPUDevice?: { prototype: Record<string, unknown> } }).GPUDevice?.prototype;
  if (!D || (D as { __traced?: boolean }).__traced) return;
  (D as { __traced?: boolean }).__traced = true;
  for (const name of ["createRenderPipeline", "createComputePipeline", "createShaderModule", "createRenderPipelineAsync", "createComputePipelineAsync"]) {
    const orig = D[name] as ((...a: unknown[]) => unknown) | undefined;
    if (typeof orig !== "function") continue;
    D[name] = function (this: unknown, ...args: unknown[]) {
      const t0 = performance.now();
      const out = orig.apply(this, args);
      const label = (args[0] as { label?: string } | undefined)?.label;
      const at = performance.timeOrigin + t0;
      if (out instanceof Promise) {
        out.then(() => gpuLog.push({ what: name, at, ms: performance.now() - t0, label })).catch(() => {});
      } else {
        const size = name === "createShaderModule" ? ` ${((args[0] as { code?: string }).code?.length ?? 0) >> 10} KB` : "";
        gpuLog.push({ what: name + size, at, ms: performance.now() - t0, label });
      }
      return out;
    };
  }
}
