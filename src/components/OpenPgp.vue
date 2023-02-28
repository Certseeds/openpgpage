<script setup lang="ts">
import * as openpgp from 'openpgp/lightweight';
import { ref, onMounted, toRefs } from 'vue';

const props = defineProps<{
  username: string
}>()

const { username } = toRefs(props);
const encryptFunction: { value: (input: string) => Promise<openpgp.WebStream<string>> } = ref(() => { return Promise.resolve('') });
const text = ref('');
const times = ref(0);
onMounted(async () => {
  const ownKey = await fetch('https://certseeds.github.io/Certseeds/public.key', {
    method: 'get',
  }).then(body => body.text());
  const publicKey = await openpgp.readKey({ armoredKey: ownKey });
  const encry = async (input: string) => {
    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: input }), // input as Message object
      encryptionKeys: publicKey,
    });
    console.log(encrypted);
    return encrypted;
  }
  encryptFunction.value = encry;
})

const publishedBooksMessage = () => {
  const encry = encryptFunction.value;
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
</script>

<template>
  <div class="greetings">
    <p>Encrypt Times {{ times }} </p>
    <div class="outter-div column1">
      <textarea v-model="text" placeholder="put your text here" @input="clear()" @change="clear()"></textarea>
      <div class="inner-div"></div>
    </div>
    <button @click="publishedBooksMessage(); times++"> click To Encrypt Word In TextArea</button>
    <p>copy encrypted text to post it in
      <a href="https://github.com/Certseeds/Certseeds/discussions/new?category=general" target="_blank">
        github discussion in new page
      </a>
    </p>
    <p>hello {{ username }}</p>
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
  position: absolute;
  height: 100%;
  width: 100%;
  line-height: 16px;
}

.inner-div {
  position: relative;
  height: calc(40vh);
  width: calc(40vw);
  visibility: hidden;
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
