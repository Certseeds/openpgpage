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
  <div>
    <p>EncryptText is encrypt By {{ id }} </p>
    <div class="outter-div column1">
      <textarea v-model="text" placeholder="put encryptText here" @input="clear()" @change="clear()"></textarea>
      <div class="inner-div"></div>
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
