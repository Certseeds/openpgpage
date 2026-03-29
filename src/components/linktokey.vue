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
    <p>copy encrypted text to post it in
      <a href="https://github.com/Certseeds/Certseeds/discussions/new?category=general" target="_blank">
        github discussion in new page
      </a>
      or get encrypt public(sub) Key ID by past it in below
    </p>
    <encryptid></encryptid>
  </div>
</template>
