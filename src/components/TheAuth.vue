<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/supabase.ts'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

const loading = ref(false)
const email = ref('')
const password = ref('')

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
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label
            for="email"
            class="block text-gray-700 font-medium mb-1"
            >Email</label
          >
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
          <label
            for="password"
            class="block text-gray-700 font-medium mb-1"
            >Password</label
          >
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

        <Button
          label="Login"
          type="submit"
          class="w-full p-button p-button-primary"
        />
      </form>
    </div>
  </div>
</template>
