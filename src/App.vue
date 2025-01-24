<script setup lang="ts">
import Button from 'primevue/button'
import Timeline from 'primevue/timeline'
import Card from 'primevue/card'
import { supabase } from '@/supabase.ts'
import { onMounted, type Ref, ref } from 'vue'
import { useSessionStore } from '@/stores/session.ts'
import Auth from '@/components/TheAuth.vue'
import Nav from '@/components/TheNav.vue'

const sessionStore = useSessionStore()

onMounted(() => {
  supabase.auth.onAuthStateChange((_, session) => {
    sessionStore.updateSession(session)
  })
  // getEvents()
})


</script>

<template>


  <!--  <header>-->
  <!--    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />-->

  <!--    <div class="wrapper">-->
  <!--      <HelloWorld msg="You did it!" />-->

  <!--      <nav>-->
  <!--        <RouterLink to="/">Home</RouterLink>-->
  <!--        <RouterLink to="/about">About</RouterLink>-->
  <!--      </nav>-->
  <!--    </div>-->
  <!--  </header>-->

  <!--  <RouterView />-->

  <Auth v-if="!sessionStore.session" />
  <RouterView v-else />
</template>

<style scoped></style>
