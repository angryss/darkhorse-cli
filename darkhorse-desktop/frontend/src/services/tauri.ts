/** Typed Tauri boundary. Import and command failures remain explicit. */
export async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  let tauriInvoke: typeof import("@tauri-apps/api/core")["invoke"];
  try {
    ({ invoke: tauriInvoke } = await import("@tauri-apps/api/core"));
  } catch (error) {
    throw new Error(`TAURI_BOUNDARY_UNAVAILABLE: ${String(error)}. Open this view in Darkhorse Desktop.`);
  }
  return tauriInvoke<T>(command, args);
}

export type VepAction = "discover" | "plan" | "implement" | "test" | "review" | "close";

export interface VepDelegationResult {
  action: VepAction;
  lifecycleStage: "DISCOVER" | "PLAN" | "IMPLEMENT" | "TEST" | "CLOSE";
  projectRoot: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  parsedJson?: unknown;
}
