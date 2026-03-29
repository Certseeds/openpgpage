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
      message: await openpgp.createMessage({ text: input }),
      encryptionKeys: await openpgp.readKey({ armoredKey: ownKey }),
      wildcard: true,
      config: {
        preferredSymmetricAlgorithm: openpgp.enums.symmetric.aes256,
        preferredHashAlgorithm: openpgp.enums.hash.sha512,
        preferredCompressionAlgorithm: openpgp.enums.compression.uncompressed,
        aeadProtect: true,
      }
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
const triggerUpload = (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files?.[0];
  if (file === undefined) {
    return;
  }
  // read string from file
  const reader = new FileReader();
  reader.onload = (e) => {
    const target = e.target as FileReader;
    text.value = target.result as string;
  }
  reader.readAsText(file);
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
  <div class="encrypt-section">
    <div class="section-header">
      <h2>Encrypt</h2>
      <span class="badge" v-if="times > 0">Encrypted {{ times }}x</span>
    </div>

    <div class="file-upload">
      <label for="upload_encrypt" class="upload-label">
        📄 Choose a plain text file
      </label>
      <input type="file" id="upload_encrypt" name="upload_encrypt" multiple="false" @change="triggerUpload" />
    </div>

    <textarea
      v-model="text"
      class="text-area"
      placeholder="Type or paste your plain text here…"
      @input="clear()"
      @change="clear()"
    ></textarea>

    <div class="actions">
      <button class="btn btn-primary" @click="publishedBooksMessage(); times++">
        🔒 Encrypt
      </button>
      <button class="btn btn-secondary" @click="triggerDownload();">
        💾 Save as file
      </button>
    </div>
  </div>
</template>

<style scoped>
.encrypt-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.section-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
}

.badge {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: hsla(160, 100%, 37%, 0.15);
  color: hsla(160, 100%, 30%, 1);
}

@media (prefers-color-scheme: dark) {
  .badge {
    color: hsla(160, 100%, 55%, 1);
  }
}

.file-upload {
  margin-bottom: 0.75rem;
}

.upload-label {
  cursor: pointer;
  font-size: 0.9rem;
}

.file-upload input[type="file"] {
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.text-area {
  display: block;
  width: 100%;
  height: 35vh;
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

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:active {
  transform: scale(0.97);
}

.btn-primary {
  background: hsla(160, 100%, 37%, 1);
  color: #fff;
}

.btn-primary:hover {
  background: hsla(160, 100%, 30%, 1);
}

.btn-secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  border-color: var(--color-border-hover);
}
</style>
