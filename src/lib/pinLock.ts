// Uygulama kilidi için PIN karma (hash) yardımcıları.
// PIN asla düz metin olarak saklanmaz; yalnızca rastgele bir tuz (salt) ile
// birlikte SHA-256 karması localStorage'da tutulur.

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return bufferToHex(bytes.buffer);
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(digest);
}
