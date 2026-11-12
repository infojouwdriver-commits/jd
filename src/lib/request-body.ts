export const MAX_API_BODY_BYTES = 262_144;

export async function readBoundedBody(request: Request, maxBytes = MAX_API_BODY_BYTES): Promise<Buffer> {
  if (Number(request.headers.get('content-length')) > maxBytes) {
    throw new Response(null, { status: 413 });
  }

  const reader = request.body?.getReader();
  if (!reader) throw new Response(null, { status: 400 });

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return Buffer.concat(chunks, size);
      size += value.byteLength;
      if (size > maxBytes) {
        void reader.cancel().catch(() => undefined);
        throw new Response(null, { status: 413 });
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
}
