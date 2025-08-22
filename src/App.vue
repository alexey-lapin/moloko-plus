<script setup lang="ts">
import { onMounted } from 'vue'
import { supabase } from '@/supabase.ts'

import { ProgressSpinner } from 'primevue'

import { useSessionStore } from '@/stores/session.ts'
import TheAuth from '@/components/TheAuth.vue'

const sessionStore = useSessionStore()

onMounted(() => {
  supabase.auth.onAuthStateChange((_, session) => {
    sessionStore.updateSession(session)
  })
})
</script>

<template>
  <div
    v-if="sessionStore.isLoading()"
    class="flex justify-center items-center h-screen"
  >
    <ProgressSpinner />
  </div>
  <TheAuth v-else-if="!sessionStore.session" />
  <RouterView v-else />
</template>
