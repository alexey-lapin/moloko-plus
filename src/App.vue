<script setup lang="ts">
import { onMounted } from 'vue'
import { supabase } from '@/supabase.ts'

import { useSessionStore } from '@/stores/session.ts'
import Auth from '@/components/TheAuth.vue'

const sessionStore = useSessionStore()

onMounted(() => {
  supabase.auth.onAuthStateChange((_, session) => {
    sessionStore.updateSession(session)
  })
})
</script>

<template>
  <Auth v-if="!sessionStore.session" />
  <RouterView v-else />
</template>

<style scoped></style>
