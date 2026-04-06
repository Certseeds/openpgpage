<script setup lang="ts">
</script>

<template>
  <header class="app-header">
    <h1>🔐 OpenPgPage</h1>
    <p class="subtitle">Encrypt your message with OpenPGP, right in the browser.</p>
    <nav class="app-nav">
      <router-link to="/">Encrypt</router-link>
      <router-link to="/wkd/">WKD</router-link>
    </nav>
  </header>
  <main>
    <router-view></router-view>
  </main>
  <footer class="app-footer">
    <p>
      Powered by <a href="https://openpgpjs.org/" target="_blank">OpenPGP.js</a>
      · <a href="https://github.com/Certseeds/openpgpage" target="_blank">Source</a>
    </p>
  </footer>
</template>

<style scoped>
.app-header {
  text-align: center;
  padding: 1.5rem 0 1rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.app-header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
}

.subtitle {
  margin-top: 0.4rem;
  font-size: 0.95rem;
  opacity: 0.65;
}

.app-nav {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.75rem;
}

.app-nav a {
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.app-nav a.router-link-active {
  background: hsla(160, 100%, 37%, 0.15);
}

.app-footer {
  text-align: center;
  padding: 1.5rem 0 0.5rem;
  margin-top: 2rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.85rem;
  opacity: 0.55;
}
</style>
