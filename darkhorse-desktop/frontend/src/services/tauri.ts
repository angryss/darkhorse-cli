/**
 * Typed wrapper around Tauri's invoke API.
 * Falls back to a mock in development when running outside the Tauri shell.
 */
export async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return await tauriInvoke<T>(command, args);
  } catch {
    console.warn(`[dev-mock] invoke("${command}") — Tauri API not available`);
    return {} as T;
  }
}
