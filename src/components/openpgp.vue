<script setup lang="ts">
import * as openpgp from 'openpgp/lightweight';
import { ref, reactive, watchEffect } from 'vue';
const props = defineProps<{
  publicKey: string
}>()
const encryptFunction = reactive({ func: (_str_: string) => { return Promise.resolve('' as openpgp.WebStream<string>) } });
const text = ref('');
const times = ref(0);

watchEffect(async () => {
  const ownKey = props.publicKey;
  const encry = async (input: string) => {
    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: input }), // input as Message object
      encryptionKeys: await openpgp.readKey({ armoredKey: ownKey })
    });
    console.log(encrypted);
    return encrypted;
  }
  encryptFunction.func = encry;
});


const publishedBooksMessage = () => {
  const encry = encryptFunction.func;
  encry(text.value)
    .then(encrypted => {
      text.value = encrypted as string;
      return;
    })
}
const clear = () => {
  if (text.value.length === 0) {
    times.value = 0;
  }
}
const triggerDownload = () => {
  const objectBlob = new Blob([text.value], { type: 'application/pgp' });
  const objUrl = URL.createObjectURL(objectBlob);
  openpgp.readKey({ armoredKey: props.publicKey }).then(x => {
    // read public keygrip from key
    return x.getEncryptionKey().then(x => {
      return x.getKeyID().toHex(); // do not want to use main keyID
    })
  })
    .then(encryptKeyID => {
      const downloadElement: HTMLAnchorElement = document.createElement('a');
      downloadElement.download = `${encryptKeyID}.${Date.now()}.encry.txt`;
      downloadElement.href = objUrl;
      downloadElement.click();
      URL.revokeObjectURL(downloadElement.href);
    })
}

</script>

<template>
  <div>
    <p>Encrypt Times {{ times }} </p>
    <div class="outter-div column1">
      <textarea v-model="text" placeholder="put your text here" @input="clear()" @change="clear()"></textarea>
    </div>
    <div class="outter-div column1">
      <button @click="publishedBooksMessage(); times++"> click To Encrypt Word In TextArea</button>
      <button @click="triggerDownload();" class="right-button">saveAsFile</button>
    </div>

  </div>
</template>

<style scoped>
.outter-div {
  border: 0px;
  position: relative;
  height: 100%;
  width: 100%;
  text-align: justify;
}

.outter-div textarea {
  border: 1px solid;
  height: calc(40vh);
  width: 100%;
  line-height: 16px;
}

.right-button {
  float: right;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {

  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
