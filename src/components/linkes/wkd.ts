import { readKeys } from 'openpgp/lightweight';

const ZBASE32_ALPHABET = 'ybndrfg8ejkmcpqxot1uwisza345h769';

export function zBase32Encode(data: Uint8Array): string {
  let result = '';
  // Process 5 bytes (40 bits) at a time -> 8 z-base-32 characters
  // SHA-1 = 20 bytes = 4 chunks of 5 bytes = 32 characters
  for (let i = 0; i < data.length; i += 5) {
    const chunk = data.subarray(i, Math.min(i + 5, data.length));
    // Build a big integer from the chunk bytes (big-endian)
    let acc = 0n;
    for (const byte of chunk) {
      acc = (acc << 8n) | BigInt(byte);
    }
    const totalBits = chunk.length * 8;
    const charCount = Math.ceil(totalBits / 5);
    // Shift left to fill the 5-bit boundary if needed
    const padBits = charCount * 5 - totalBits;
    acc <<= BigInt(padBits);
    for (let j = charCount - 1; j >= 0; j--) {
      const index = Number((acc >> BigInt(j * 5)) & 0x1fn);
      result += ZBASE32_ALPHABET[index];
    }
  }
  return result;
}

export async function computeWkdHash(localPart: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(localPart.toLowerCase());
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-1', data));
  return zBase32Encode(hash);
}

export interface EmailInfo {
  email: string;
  localPart: string;
  domain: string;
}

export interface ParsedKeyInfo {
  fingerprint: string;
  emails: EmailInfo[];
  keyBinary: Uint8Array;
}

export async function parseArmoredKeys(armoredText: string): Promise<ParsedKeyInfo[]> {
  const keys = await readKeys({ armoredKeys: armoredText });
  const result: ParsedKeyInfo[] = [];

  for (const key of keys) {
    const revoked = await key.isRevoked();
    if (revoked) continue;

    const emails: EmailInfo[] = [];
    for (const user of key.users) {
      if (user.userID?.email) {
        const email = user.userID.email;
        const atIndex = email.lastIndexOf('@');
        if (atIndex > 0) {
          emails.push({
            email,
            localPart: email.substring(0, atIndex),
            domain: email.substring(atIndex + 1),
          });
        }
      }
    }

    if (emails.length > 0) {
      result.push({
        fingerprint: key.getFingerprint(),
        emails,
        keyBinary: key.write() as Uint8Array,
      });
    }
  }

  return result;
}

export interface WkdEmailDisplay {
  email: string;
  localPart: string;
  domain: string;
  wkdHash: string;
  fingerprint: string;
}

export async function computeWkdDisplayInfo(keys: ParsedKeyInfo[]): Promise<WkdEmailDisplay[]> {
  const result: WkdEmailDisplay[] = [];
  for (const key of keys) {
    for (const { email, localPart, domain } of key.emails) {
      const hash = await computeWkdHash(localPart);
      result.push({ email, localPart, domain, wkdHash: hash, fingerprint: key.fingerprint });
    }
  }
  return result;
}

export interface WkdFileEntry {
  path: string;
  content: Uint8Array;
}

function concatenateBuffers(buffers: Uint8Array[]): Uint8Array {
  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const b of buffers) {
    result.set(b, offset);
    offset += b.length;
  }
  return result;
}

export async function generateWkdFiles(keys: ParsedKeyInfo[]): Promise<WkdFileEntry[]> {
  const files: WkdFileEntry[] = [];
  const emptyContent = new Uint8Array(0);

  // Advanced (subdomain) format: group by (domain, localPart) -> key binaries
  const advancedMap = new Map<string, {
    domain: string; localPart: string; hash: string;
    keyBinaries: Map<string, Uint8Array>;
  }>();
  // Direct (standard) format: group by localPart -> key binaries
  const directMap = new Map<string, {
    hash: string;
    keyBinaries: Map<string, Uint8Array>;
  }>();

  for (const key of keys) {
    for (const { localPart, domain } of key.emails) {
      const hash = await computeWkdHash(localPart);
      const lp = localPart.toLowerCase();

      // Advanced format grouping
      const advKey = `${domain}\0${lp}`;
      if (!advancedMap.has(advKey)) {
        advancedMap.set(advKey, { domain, localPart: lp, hash, keyBinaries: new Map() });
      }
      advancedMap.get(advKey)!.keyBinaries.set(key.fingerprint, key.keyBinary);

      // Direct format grouping
      if (!directMap.has(lp)) {
        directMap.set(lp, { hash, keyBinaries: new Map() });
      }
      directMap.get(lp)!.keyBinaries.set(key.fingerprint, key.keyBinary);
    }
  }

  // --- Advanced (subdomain) format files ---
  const domains = new Set<string>();
  for (const [, { domain, localPart, hash, keyBinaries }] of advancedMap) {
    domains.add(domain);
    const combined = concatenateBuffers([...keyBinaries.values()]);
    files.push({ path: `.well-known/openpgpkey/${domain}/hu/${hash}`, content: combined });
    files.push({
      path: `.well-known/openpgpkey/${domain}/hu/${hash.substring(0, 8)}.${localPart}`,
      content: emptyContent,
    });
  }
  for (const domain of domains) {
    files.push({ path: `.well-known/openpgpkey/${domain}/policy`, content: emptyContent });
  }

  // --- Direct (standard) format files ---
  files.push({ path: '.well-known/openpgpkey/policy', content: emptyContent });
  for (const [, { hash, keyBinaries }] of directMap) {
    const combined = concatenateBuffers([...keyBinaries.values()]);
    files.push({ path: `.well-known/openpgpkey/hu/${hash}`, content: combined });
  }

  // --- Static Hosting Config Files (CORS) ---
  const encoder = new TextEncoder();
  // Cloudflare Pages / Netlify: _headers
  const headersContent = `/*\n  Access-Control-Allow-Origin: *\n`;
  files.push({ path: '_headers', content: encoder.encode(headersContent) });

  // Vercel: vercel.json
  const vercelConfig = {
    headers: [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ],
  };
  files.push({
    path: 'vercel.json',
    content: encoder.encode(JSON.stringify(vercelConfig, null, 2)),
  });

  // Firebase Hosting: firebase.json
  const firebaseConfig = {
    hosting: {
      headers: [
        {
          source: '**',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
          ],
        },
      ],
    },
  };
  files.push({
    path: 'firebase.json',
    content: encoder.encode(JSON.stringify(firebaseConfig, null, 2)),
  });
  return files;
}
