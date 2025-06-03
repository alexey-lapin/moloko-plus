import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase.ts'
import type { Session } from '@supabase/supabase-js'

export const useSessionStore = defineStore('session', () => {
  const session: Ref<Session | null | undefined> = ref(undefined)

  supabase.auth.getSession().then((response) => {
    session.value = response.data.session
  })

  function isLoading(): boolean {
    return session.value === undefined
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  function updateSession(newSession: Session | null) {
    session.value = newSession
  }

  return { session, isLoading, logout, updateSession }
})
