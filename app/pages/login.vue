<script setup lang="ts">
const loginEmail = ref('')
const loginPassword = ref('')
const loginErrorMsg = ref('')
const loginLoading = ref(false)

const registerPseudo = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')
const registerErrorMsg = ref('')
const registerLoading = ref(false)

const { fetch: refreshSession } = useUserSession()

async function handleLogin() {
  loginErrorMsg.value = ''
  loginLoading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: loginEmail.value, password: loginPassword.value },
    })
    await refreshSession()
    navigateTo('/dashboard')
  } catch (e: any) {
    loginErrorMsg.value = e.data?.message || e.data?.statusMessage || 'Erreur de connexion'
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  registerErrorMsg.value = ''

  if (registerPassword.value !== registerConfirmPassword.value) {
    registerErrorMsg.value = 'Les mots de passe ne correspondent pas'
    return
  }

  registerLoading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        pseudo: registerPseudo.value,
        email: registerEmail.value,
        password: registerPassword.value,
      },
    })
    await refreshSession()
    navigateTo('/dashboard')
  } catch (e: any) {
    registerErrorMsg.value = e.data?.message || e.data?.statusMessage || 'Erreur lors de l\'inscription'
  } finally {
    registerLoading.value = false
  }
}

// Masquer le header du layout
const hideHeader = useState<boolean>('layout-hide-header', () => false)
onMounted(() => { hideHeader.value = true })
onUnmounted(() => { hideHeader.value = false })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-4xl">
      <div class="text-center mb-7">
        <p class="text-white/45 text-xs uppercase tracking-[0.28em] mb-2">Cinema BI</p>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-wide mb-2">Bienvenue</h1>
        <p class="text-sm text-white/45">Connectez-vous à gauche ou créez votre compte à droite.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[0.78fr_auto_1.22fr] gap-6 lg:gap-6 items-start">
      <section class="glass glass-panel glass-red p-6 lg:p-5">
        <h2 class="text-xl font-extrabold text-white text-center mb-2 tracking-wide">Connexion</h2>
        <p class="text-white/40 text-sm text-center mb-6">Connectez-vous pour noter et commenter</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
            <input
              v-model="loginEmail"
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
              v-model="loginPassword"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div v-if="loginErrorMsg" class="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">
            {{ loginErrorMsg }}
          </div>

          <button
            type="submit"
            :disabled="loginLoading"
            class="w-full glass glass-btn glass-red text-white font-semibold py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ loginLoading ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>

        <p class="mt-2 text-center">
          <NuxtLink to="/dashboard" class="text-white/20 hover:text-white/50 text-xs transition-colors">← Retour au dashboard</NuxtLink>
        </p>
      </section>

      <div class="hidden lg:block w-px self-stretch bg-white/15 rounded-full my-8" />

      <section class="glass glass-panel glass-red p-8">
        <h2 class="text-3xl font-extrabold text-white text-center mb-2 tracking-wide">Créer un compte</h2>
        <p class="text-white/40 text-sm text-center mb-8">Rejoignez la communauté Cinema BI</p>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Pseudo</label>
            <input
              v-model="registerPseudo"
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
              v-model="registerEmail"
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
              v-model="registerPassword"
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
              v-model="registerConfirmPassword"
              type="password"
              required
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div v-if="registerErrorMsg" class="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">
            {{ registerErrorMsg }}
          </div>

          <button
            type="submit"
            :disabled="registerLoading"
            class="w-full glass glass-btn glass-red text-white font-semibold py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ registerLoading ? 'Création…' : 'Créer mon compte' }}
          </button>
        </form>
      </section>
      </div>
    </div>
  </div>
</template>
