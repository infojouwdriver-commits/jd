let stopCurrent: (() => Promise<void>) | null = null;

export function registerFleetSharingStopper(stopper: () => Promise<void>): () => void {
  stopCurrent = stopper;
  return () => { if (stopCurrent === stopper) stopCurrent = null; };
}

/** Stops position production and waits for an already-started update before a privacy state change. */
export async function stopFleetSharingRuntime(): Promise<void> {
  await stopCurrent?.();
}
