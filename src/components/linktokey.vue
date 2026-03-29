<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import openpgp from '@/components/openpgp.vue';
import encryptid from '@/components/encrypyid.vue';

const DEFAULT_KEY_URL = 'https://blog.certseeds.com/public.key';
const ownKey = reactive({ key: '' });

onMounted(async () => {
  const resp = await fetch(DEFAULT_KEY_URL, { method: 'get' });
  ownKey.key = await resp.text();
});
</script>

<template>
  <div>
    <openpgp :publicKey="ownKey.key"></openpgp>

    <div class="divider"></div>

    <p class="hint">
      Copy the encrypted text and post it in a
      <a href="https://github.com/Certseeds/Certseeds/discussions/new?category=general" target="_blank">
        GitHub Discussion
      </a>, or paste an encrypted message below to identify its encryption key.
    </p>

    <encryptid></encryptid>
  </div>
</template>

<style scoped>
.divider {
  border-top: 1px solid var(--color-border);
  margin: 1.5rem 0;
}

.hint {
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.75;
  margin-bottom: 1rem;
}
</style>
