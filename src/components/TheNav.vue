<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useColorMode, useCycleList } from '@vueuse/core'

import Button from 'primevue/button'
import type { MenuItem } from 'primevue/menuitem'
import { Menubar } from 'primevue'

import { useSessionStore } from '@/stores/session.ts'

const sessionStore = useSessionStore()

const mode = useColorMode({
  emitAuto: true,
})

const { state, next } = useCycleList(['dark', 'light', 'auto'] as const, {
  initialValue: mode,
})

watchEffect(() => (mode.value = state.value))

const modeIcon = computed(() => {
  if (state.value === 'auto') {
    return 'pi pi-desktop'
  } else if (state.value === 'light') {
    return 'pi pi-sun'
  } else if (state.value === 'dark') {
    return 'pi pi-moon'
  }
  return ''
})

const items: MenuItem[] = []
</script>

<template>
  <Menubar :model="items">
    <template #start>
      <h1 class="text-xl">🍼 Moloko+</h1>
    </template>

    <template #end>
      <div class="flex items-center gap-2">
        <Button
          :icon="modeIcon"
          text
          severity="secondary"
          @click="next()"
        />
        <Button
          label="Logout"
          severity="secondary"
          @click="sessionStore.logout()"
        />
      </div>
    </template>
  </Menubar>
</template>
