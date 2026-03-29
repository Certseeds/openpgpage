<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { getEncryKeyFromText } from '@/components/linkes/openpgp';
const text = ref('');
const id = ref('');

watchEffect(async () => {
  const textValue = text.value;
  const idStirng = await getEncryKeyFromText(textValue);
  id.value = idStirng;
});

const clear = () => {
  if (text.value.length === 0) {
    id.value = '';
  }
}

</script>

<template>
  <div class="identify-section">
    <div class="section-header">
      <h2>Identify</h2>
      <span class="key-id" v-if="id">🔑 {{ id }}</span>
    </div>
    <textarea
      v-model="text"
      class="text-area"
      placeholder="Paste encrypted PGP message here to identify the encryption key…"
      @input="clear()"
      @change="clear()"
    ></textarea>
  </div>
</template>

<style scoped>
.identify-section {
  margin-top: 0.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.section-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
}

.key-id {
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  word-break: break-all;
}

.text-area {
  display: block;
  width: 100%;
  height: 20vh;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s;
}

.text-area:focus {
  outline: none;
  border-color: hsla(160, 100%, 37%, 0.6);
}
</style>
