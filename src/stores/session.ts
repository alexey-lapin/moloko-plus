import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase.ts'
import type { Session } from '@supabase/supabase-js'

export const useSessionStore = defineStore('session', () => {
  const session = ref()

  supabase.auth.getSession().then((response) => {
    session.value = response.data.session
  })

  async function logout() {
    await supabase.auth.signOut()
  }

  function updateSession(newSession: Session | null) {
    session.value = newSession
  }

  return { session, logout, updateSession }
})
