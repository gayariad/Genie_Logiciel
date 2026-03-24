<template>
  <div class="relative h-screen text-white overflow-hidden flex flex-col" :class="hideHeader ? 'bg-[#1a0000]' : 'bg-animated-red'">
    <div
      class="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 ease-out"
      :class="heroBgEnabled ? 'opacity-100' : 'opacity-0'"
    >
      <Transition name="hero-bg-fade">
        <div
          v-if="heroBgImage"
          :key="`hero-bg-${heroBgFrameKey}`"
          class="absolute inset-0 hero-bg-image-layer"
          :style="{ backgroundImage: `url('${heroBgImage}')` }"
        />
      </Transition>
    </div>

    <!-- Header -->
    <header v-if="!hideHeader" class="relative z-10 flex items-center justify-between px-8 py-5 shrink-0">
      <!-- Logo placeholder -->
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </div>
      <span class="text-sm font-medium tracking-widest uppercase text-white/40">movie analytics</span>

      <!-- Auth status -->
      <div class="flex items-center gap-3">
        <template v-if="loggedIn">
          <NuxtLink to="/profil" class="flex items-center gap-2 glass glass-pill px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ user?.pseudo }}
          </NuxtLink>
        </template>
        <template v-else>
          <button
            type="button"
            class="glass glass-pill px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
            @click="openAuthPopoverFromHeader"
          >
            Connexion
          </button>
        </template>
      </div>
    </header>

    <!-- Sidebar flottante centrée verticalement — liquid glass -->
    <nav class="fixed left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 py-5 px-3 w-16 glass glass-sidebar">
      <NuxtLink to="/dashboard" class="sidebar-icon" title="Dashboard">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        </svg>
      </NuxtLink>

      <NuxtLink v-if="loggedIn" to="/profil" class="sidebar-icon" title="Profil">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </NuxtLink>
      <button v-else type="button" class="sidebar-icon" title="Profil" @click="openAuthPopoverFromSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <NuxtLink to="/watchlist" class="sidebar-icon" title="WatchList">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </NuxtLink>

      <NuxtLink to="/favoris" class="sidebar-icon" title="Favoris">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </NuxtLink>

      <NuxtLink to="/stats" class="sidebar-icon" title="Stats">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </NuxtLink>

      <!-- Séparateur glass -->
      <div class="w-7 border-t border-white/15 my-1" />

      <NuxtLink to="/search" class="sidebar-icon" title="Recherche">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </NuxtLink>
    </nav>

    <Transition name="auth-popover-fade">
      <div
        v-if="showAuthPopover"
        class="fixed inset-0 z-[70]"
        @keydown.esc.window="closeAuthPopover"
      >
        <button
          type="button"
          class="absolute inset-0"
          aria-label="Fermer la fenêtre de connexion"
          @click="closeAuthPopover"
        />

        <div
          class="fixed z-[71] w-[min(92vw,360px)] max-h-[calc(100vh-24px)] overflow-y-auto glass glass-panel glass-red p-5"
          :style="authPopoverStyle"
          @click.stop
        >
          <p class="text-white/35 text-[11px] uppercase tracking-[0.22em] mb-2">Connexion requise</p>
          <h3 class="text-xl font-extrabold text-white tracking-wide">
            {{ authMode === 'login' ? 'Se connecter' : 'Créer un compte' }}
          </h3>
          <p class="text-white/45 text-xs mt-1">Connectez-vous pour accéder à votre profil et à vos actions.</p>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="switchAuthMode('login')"
              :class="authMode === 'login' ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/60 border-white/10'"
              class="rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
            >
              Connexion
            </button>
            <button
              type="button"
              @click="switchAuthMode('register')"
              :class="authMode === 'register' ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/60 border-white/10'"
              class="rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
            >
              Inscription
            </button>
          </div>

          <form @submit.prevent="submitAuthPopover" class="mt-4 space-y-3">
            <div v-if="authMode === 'register'">
              <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Pseudo</label>
              <input
                v-model="authPseudo"
                type="text"
                required
                autocomplete="username"
                placeholder="Votre pseudo"
                class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <input
                v-model="authEmail"
                type="email"
                required
                autocomplete="email"
                placeholder="votre@email.com"
                class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Mot de passe</label>
              <input
                v-model="authPassword"
                type="password"
                required
                :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'"
                minlength="4"
                maxlength="30"
                placeholder="••••••••"
                class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div v-if="authMode === 'register'">
              <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
              <input
                v-model="authConfirmPassword"
                type="password"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div v-if="authErrorMsg" class="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">
              {{ authErrorMsg }}
            </div>

            <button
              type="submit"
              :disabled="authLoading"
              class="w-full glass glass-btn glass-red text-white font-semibold py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{
                authLoading
                  ? (authMode === 'login' ? 'Connexion…' : 'Création…')
                  : (authMode === 'login' ? 'Se connecter' : 'Créer mon compte')
              }}
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Contenu principal -->
    <main ref="mainRef" class="relative z-10 pl-24 pr-8 pb-8 overflow-y-auto flex-1 min-h-0 snap-y snap-mandatory scroll-smooth">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const mainRef = ref<HTMLElement | null>(null)

watch(() => route.fullPath, () => {
  mainRef.value?.scrollTo({ top: 0 })
})

const heroBgEnabled = useState<boolean>('dashboard-hero-bg-enabled', () => false)
const heroBgImage = useState<string>('dashboard-hero-bg-image', () => '')
const heroBgFrameKey = useState<number>('dashboard-hero-bg-frame-key', () => 0)
const hideHeader = useState<boolean>('layout-hide-header', () => false)

const { loggedIn, user, fetch: refreshSession } = useUserSession()

type AuthAnchor = 'header' | 'sidebar'

const showAuthPopover = ref(false)
const authPopoverStyle = ref<Record<string, string>>({ top: '12px', left: '12px' })
const authAnchor = ref<AuthAnchor>('header')
const authAnchorEl = ref<HTMLElement | null>(null)
const authPendingRedirect = ref<string | null>(null)

const authMode = ref<'login' | 'register'>('login')
const authPseudo = ref('')
const authEmail = ref('')
const authPassword = ref('')
const authConfirmPassword = ref('')
const authErrorMsg = ref('')
const authLoading = ref(false)

function resetAuthFields() {
  authPseudo.value = ''
  authEmail.value = ''
  authPassword.value = ''
  authConfirmPassword.value = ''
  authErrorMsg.value = ''
  authLoading.value = false
}

function setAuthPopoverPosition() {
  if (!import.meta.client || !authAnchorEl.value) return

  const rect = authAnchorEl.value.getBoundingClientRect()
  const margin = 12
  const popoverWidth = Math.min(360, window.innerWidth - margin * 2)

  let left = rect.right - popoverWidth
  let top = rect.bottom + 10

  if (authAnchor.value === 'sidebar') {
    left = rect.right + 12
    top = rect.top - 8
  }

  const maxLeft = window.innerWidth - popoverWidth - margin
  left = Math.min(Math.max(left, margin), maxLeft)
  top = Math.min(Math.max(top, margin), window.innerHeight - margin - 180)

  authPopoverStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
  }
}

function openAuthPopover(anchor: AuthAnchor, event: MouseEvent, redirectTo: string | null = null) {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return

  authAnchor.value = anchor
  authAnchorEl.value = target
  authPendingRedirect.value = redirectTo
  authMode.value = 'login'
  resetAuthFields()
  showAuthPopover.value = true
  nextTick(setAuthPopoverPosition)
}

function openAuthPopoverFromHeader(event: MouseEvent) {
  openAuthPopover('header', event, null)
}

function openAuthPopoverFromSidebar(event: MouseEvent) {
  openAuthPopover('sidebar', event, '/profil')
}

function closeAuthPopover() {
  showAuthPopover.value = false
  authAnchorEl.value = null
  authPendingRedirect.value = null
  authErrorMsg.value = ''
}

function switchAuthMode(mode: 'login' | 'register') {
  if (authLoading.value) return
  authMode.value = mode
  authErrorMsg.value = ''
  nextTick(setAuthPopoverPosition)
}

async function submitAuthPopover() {
  authErrorMsg.value = ''

  if (authMode.value === 'register' && authPassword.value !== authConfirmPassword.value) {
    authErrorMsg.value = 'Les mots de passe ne correspondent pas'
    return
  }

  authLoading.value = true
  try {
    if (authMode.value === 'login') {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: authEmail.value,
          password: authPassword.value,
        },
      })
    } else {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          pseudo: authPseudo.value,
          email: authEmail.value,
          password: authPassword.value,
        },
      })
    }

    const redirectTo = authPendingRedirect.value
    await refreshSession()
    closeAuthPopover()

    if (redirectTo) {
      navigateTo(redirectTo)
    }
  } catch (e: any) {
    authErrorMsg.value = e.data?.message || e.data?.statusMessage || 'Erreur d\'authentification'
  } finally {
    authLoading.value = false
  }
}

watch(showAuthPopover, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    window.addEventListener('resize', setAuthPopoverPosition)
  } else {
    window.removeEventListener('resize', setAuthPopoverPosition)
  }
})

onUnmounted(() => {
  if (!import.meta.client) return
  window.removeEventListener('resize', setAuthPopoverPosition)
})
</script>

<style scoped>
.hero-bg-fade-enter-active,
.hero-bg-fade-leave-active {
  transition: opacity 850ms ease;
}

.hero-bg-fade-enter-from,
.hero-bg-fade-leave-to {
  opacity: 0;
}

.hero-bg-image-layer {
  background-size: cover;
  background-position: center;
  transform: scale(1.16);
  filter: blur(58px) saturate(1.15);
}

.auth-popover-fade-enter-active,
.auth-popover-fade-leave-active {
  transition: opacity 160ms ease;
}

.auth-popover-fade-enter-from,
.auth-popover-fade-leave-to {
  opacity: 0;
}
</style>
