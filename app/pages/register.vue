<script setup lang="ts">
const pseudo = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const loading = ref(false)

const { fetch: refreshSession } = useUserSession()

async function handleRegister() {
  errorMsg.value = ''

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { pseudo: pseudo.value, email: email.value, password: password.value },
    })
    await refreshSession()
    navigateTo('/dashboard')
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.data?.statusMessage || 'Erreur lors de l\'inscription'
  } finally {
    loading.value = false
  }
}

const hideHeader = useState<boolean>('layout-hide-header', () => false)
onMounted(() => { hideHeader.value = true })
onUnmounted(() => { hideHeader.value = false })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass glass-panel glass-red w-full max-w-md p-8">
      <h1 class="text-3xl font-extrabold text-white text-center mb-2 tracking-wide">Créer un compte</h1>
      <p class="text-white/40 text-sm text-center mb-8">Rejoignez la communauté Cinema BI</p>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Pseudo</label>
          <input
            v-model="pseudo"
            type="text"
            required
            autocomplete="username"
            placeholder="Votre pseudo"
            class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

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
            autocomplete="new-password"
            minlength="4"
            maxlength="30"
            placeholder="••••••••"
            class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
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
          {{ loading ? 'Création…' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="mt-6 text-center text-white/30 text-sm">
        Déjà un compte ?
        <NuxtLink to="/login" class="text-white/60 hover:text-white underline transition-colors">Se connecter</NuxtLink>
      </p>

      <p class="mt-3 text-center">
        <NuxtLink to="/dashboard" class="text-white/20 hover:text-white/50 text-xs transition-colors">← Retour au dashboard</NuxtLink>
      </p>
    </div>
  </div>
</template>
