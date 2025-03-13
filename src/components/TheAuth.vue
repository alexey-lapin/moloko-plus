<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/supabase.ts'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

const loading = ref(false)
const email = ref('')
const password = ref('')

// let sessionStore = useSessionStore()

const handleLogin = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) {
      throw error
    }
    // alert('Check your email for the login link!')
    // sessionStore.updateSession(supabase.auth.session())
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!--  <form class="row flex-center flex" @submit.prevent="handleLogin">-->
  <!--    <div class="col-6 form-widget">-->
  <!--      <h1 class="header">Supabase + Vue 3</h1>-->
  <!--      <p class="description">Sign in via magic link with your email below</p>-->
  <!--      <div>-->
  <!--        <input class="inputField" required type="email" placeholder="Your email" v-model="email" />-->
  <!--        <input class="inputField" required type="password" placeholder="Your pass" v-model="password" />-->
  <!--      </div>-->
  <!--      <div>-->
  <!--        <input-->
  <!--          type="submit"-->
  <!--          class="button block"-->
  <!--          :value="loading ? 'Loading' : 'Send magic link'"-->
  <!--          :disabled="loading"-->
  <!--        />-->
  <!--      </div>-->
  <!--    </div>-->
  <!--  </form>-->
  <div class="min-h-screen flex items-center justify-center bg-gray-100_">
    <div class="w-full max-w-md p-8 bg-white_ rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 font-medium mb-1">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            class="w-full p-inputtext1"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="mb-6">
          <label for="password" class="block text-gray-700 font-medium mb-1">Password</label>
          <Password
            id="password"
            v-model="password"
            :toggleMask="true"
            :feedback="false"
            class="w-full"
            input-class="w-full"
            placeholder="Enter your password"
            required
          />
        </div>

        <Button label="Login" type="submit" class="w-full p-button p-button-primary" />
      </form>

<!--      <p class="mt-4 text-center text-gray-600">-->
<!--        Don't have an account?-->
<!--        <a href="#" class="text-blue-500 hover:underline">Sign Up</a>-->
<!--      </p>-->
    </div>
  </div>
</template>

<style scoped>

</style>
