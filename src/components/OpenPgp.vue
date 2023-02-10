<script setup lang="ts">
import * as openpgp from 'openpgp/lightweight';
defineProps<{
  msg: string
}>()
</script>
<script lang="ts">
export default{
  data() {
    return {
        text: '',
        times: 0
    }
  },
  methods: {
    // 一个计算属性的 getter
      publishedBooksMessage () {
        encry(this.text)
        .then(encrypted => {
            this.text = encrypted as string;
            return;
        })
      // `this` 指向当前组件实例
    },
    clear() {
        if(this.text.length === 0){
            this.times = 0;
        }
    }
  }
}
const ownKey = await fetch('https://certseeds.github.io/Certseeds/public.key', {
      method: 'get'
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
</script>

<template>
  <div class="greetings">
    <p >Encrypt Times {{ times }} </p>
    <div class="outter-div column1">    
        <textarea v-model="text" placeholder="put your text here"  @input="clear()" @change="clear()"></textarea>
        <div class="inner-div"></div>
    </div>
    <button @click="publishedBooksMessage();times++"> click To Encrypt Word In TextArea</button>
    <p>copy encrypted text to post it in
        <a href="https://github.com/Certseeds/Certseeds/discussions/new?category=general" target="_blank">
            github discussion in new page
        </a>
    </p>
  </div>
</template>

<style scoped>

.outter-div{
    border: 0px;
    position: relative;
    height: 100%;
    width: 100%;
    text-align: justify;
}
.outter-div textarea{
    border: 1px solid;
    position: absolute;
    height: 100%;
    width: 100%;
    line-height: 16px;
}
.inner-div{
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
