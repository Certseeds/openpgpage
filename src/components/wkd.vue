<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  parseArmoredKeys,
  computeWkdDisplayInfo,
  generateWkdFiles,
  type ParsedKeyInfo,
  type WkdEmailDisplay,
} from './linkes/wkd';
import JSZip from 'jszip';

const url = ref('');
const loading = ref(false);
const error = ref('');
const parsedKeys = ref<ParsedKeyInfo[]>([]);
const displayInfo = ref<WkdEmailDisplay[]>([]);

const hasResults = computed(() => parsedKeys.value.length > 0);

const groupedByKey = computed(() => {
  const groups = new Map<string, WkdEmailDisplay[]>();
  for (const item of displayInfo.value) {
    if (!groups.has(item.fingerprint)) {
      groups.set(item.fingerprint, []);
    }
    groups.get(item.fingerprint)!.push(item);
  }
  return groups;
});

async function processArmoredText(armoredText: string) {
  const keys = await parseArmoredKeys(armoredText);
  if (keys.length === 0) {
    error.value = 'No valid (non-revoked) keys found in the fetched data.';
    return;
  }
  parsedKeys.value = keys;
  displayInfo.value = await computeWkdDisplayInfo(keys);
}

async function loadKey() {
  const trimmed = url.value.trim();
  if (!trimmed) {
    error.value = 'Please enter a URL';
    return;
  }

  loading.value = true;
  error.value = '';
  parsedKeys.value = [];
  displayInfo.value = [];

  try {
    const resp = await fetch(trimmed, { method: 'GET' });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
    await processArmoredText(await resp.text());
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load or parse the key';
  } finally {
    loading.value = false;
  }
}

function loadFromFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  error.value = '';
  parsedKeys.value = [];
  displayInfo.value = [];
  loading.value = true;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      await processArmoredText((e.target as FileReader).result as string);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to parse the key file';
    } finally {
      loading.value = false;
      (event.target as HTMLInputElement).value = '';
    }
  };
  reader.onerror = () => {
    error.value = 'Failed to read the file';
    loading.value = false;
  };
  reader.readAsText(file);
}

async function downloadZip() {
  try {
    const files = await generateWkdFiles(parsedKeys.value);
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.path, file.content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const objUrl = URL.createObjectURL(blob);
    const fingerprints = parsedKeys.value.map(k => k.fingerprint).join('_');
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = `${fingerprints}.wkd.zip`;
    a.click();
    URL.revokeObjectURL(objUrl);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to generate ZIP';
  }
}
</script>

<template>
  <div class="wkd-section">
    <h2>WKD Generator</h2>
    <p class="description">
      Enter a URL pointing to an ASCII-armored OpenPGP public key.
      The tool will parse the key(s), extract email addresses, and generate
      WKD (Web Key Directory) static files packaged as a ZIP.
    </p>

    <div class="input-group">
      <input
        v-model="url"
        type="url"
        class="url-input"
        placeholder="https://example.com/public.key"
        @keyup.enter="loadKey"
      />
      <button @click="loadKey" :disabled="loading" class="btn">
        {{ loading ? 'Loading…' : 'Load' }}
      </button>
    </div>
    <div class="file-load">
      <label class="file-label">
        📄 Or load from a local file
        <input type="file" accept=".asc,.txt,.key,.pub" class="file-input" @change="loadFromFile" />
      </label>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="hasResults">
      <div class="results">
        <h3>Parsed Keys</h3>

        <div v-for="[fp, emails] of groupedByKey" :key="fp" class="key-group">
          <div class="key-header">
            🔑 <code>{{ fp }}</code>
          </div>
          <table class="email-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Domain</th>
                <th>WKD Hash</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in emails" :key="item.email">
                <td>{{ item.email }}</td>
                <td>{{ item.domain }}</td>
                <td><code>{{ item.wkdHash }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <button @click="downloadZip" class="btn btn-download">
          📦 Download WKD ZIP
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.wkd-section {
  margin-top: 0.5rem;
}

.description {
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.75;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.url-input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.95rem;
}

.url-input:focus {
  outline: none;
  border-color: var(--color-border-hover);
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  background: hsla(160, 100%, 30%, 1);
}

.btn-download {
  margin-top: 1.5rem;
  width: 100%;
}

.file-load {
  margin-bottom: 1rem;
}

.file-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.88rem;
  opacity: 0.75;
  padding: 0.3rem 0;
}

.file-label:hover {
  opacity: 1;
}

.file-input {
  display: none;
}

.error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.results {
  margin-top: 1rem;
}

.key-group {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.key-header {
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  word-break: break-all;
}

.key-header code {
  font-size: 0.8rem;
  opacity: 0.8;
}

.email-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.email-table th,
.email-table td {
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

.email-table th {
  font-weight: 600;
  opacity: 0.7;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.email-table td code {
  font-size: 0.8rem;
  word-break: break-all;
}

h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
</style>
