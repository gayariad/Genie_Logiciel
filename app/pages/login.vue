<script setup lang="ts">
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const { fetch: refreshSession } = useUserSession()

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await refreshSession()
    navigateTo('/dashboard')
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.data?.statusMessage || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}

// Masquer le header du layout
const hideHeader = useState<boolean>('layout-hide-header', () => false)
onMounted(() => { hideHeader.value = true })
onUnmounted(() => { hideHeader.value = false })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass glass-panel glass-red w-full max-w-md p-8">
      <h1 class="text-3xl font-extrabold text-white text-center mb-2 tracking-wide">Connexion</h1>
      <p class="text-white/40 text-sm text-center mb-8">Connectez-vous pour noter et commenter</p>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="votre@email.com"
            class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div v-if="errorMsg" class="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full glass glass-btn glass-red text-white font-semibold py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <p class="mt-6 text-center text-white/30 text-sm">
        Pas encore de compte ?
        <NuxtLink to="/register" class="text-white/60 hover:text-white underline transition-colors">Créer un compte</NuxtLink>
      </p>

      <p class="mt-3 text-center">
        <NuxtLink to="/dashboard" class="text-white/20 hover:text-white/50 text-xs transition-colors">← Retour au dashboard</NuxtLink>
      </p>
    </div>
  </div>
</template>
