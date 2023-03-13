<script setup lang="ts">
import { reactive, toRefs, watchEffect } from 'vue';
import { getKeyCanEncryptAndNotRevoked } from '@/components/openpgp';
import openpgp from '@/components/openpgp.vue';
import encryptid from '@/components/encrypyid.vue';
const props = defineProps<{
  username: string
}>()

const { username } = toRefs(props);
const ownKey = reactive({ key: '' })
const getFetchRawKey: (input: string) => Promise<string> = async (input: string) => {
  if ((input?.length ?? 0) > 0) {
    const url = `https://api.github.com/users/${username.value}/gpg_keys`
    const ownKey = await fetch(url, {
      method: 'get',
      headers: { 'Accept': 'application/vnd.github+json', },
    }).then(body => body.json())
      .then(bodyJson => {
        const value = getKeyCanEncryptAndNotRevoked(bodyJson);
        return value.raw_key
      }) ?? '';
    return ownKey;
  }
  return await fetch('https://certseeds.github.io/Certseeds/public.key', {
    method: 'get',
  }).then(body => body.text());
}

watchEffect(async () => {
  const username_value = username.value;
  // api.github.com/
  ownKey.key = await getFetchRawKey(username_value);
});


</script>

<template>
  <div>
    <p>encry Target is github user {{ username }}</p>
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
