// Shared by trip actions and logout; acquisition happens before the first await.
export function createActionGate() {
  let held = false;
  return {
    acquire() {if (held) return false; held = true; return true;},
    release() {held = false;},
  };
}
export type ActionGate = ReturnType<typeof createActionGate>;
