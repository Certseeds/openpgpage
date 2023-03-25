<script setup lang="ts">
import { reactive, toRefs, watchEffect } from 'vue';
import openpgp from '@/components/openpgp.vue';
import encryptid from '@/components/encrypyid.vue';
import { getOrFetch } from '@/components/cache';
const props = defineProps<{
  path: string
}>()

const { path } = toRefs(props);
const ownKey = reactive({ key: '' })


watchEffect(async () => {
  const path_value = path.value ?? '';
  ownKey.key = await (await getOrFetch(path_value)).rawKey;
  // api.github.com/
});
</script>

<template>
  <div>
    <p>encry Target come from path {{ path }}</p>
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
