<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useColorMode, useCycleList } from '@vueuse/core'

import Button from 'primevue/button'
import { Menubar } from 'primevue'

import { useSessionStore } from '@/stores/session.ts'

import type { MenuItem } from 'primevue/menuitem'

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
  <div class="fixed top-0 left-0 right-0 z-50 safe-area-navbar">
    <Menubar
      :model="items"
      class="safe-area-content"
    >
      <template #start>
        <h1 class="text-xl font-semibold">🍼 Moloko+</h1>
      </template>

      <template #end>
        <div class="flex items-center gap-2">
          <Button
            :icon="modeIcon"
            text
            severity="secondary"
            size="small"
            @click="next()"
          />
          <Button
            label="Logout"
            severity="secondary"
            size="small"
            @click="sessionStore.logout()"
          />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<style scoped>
.safe-area-navbar {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.safe-area-content {
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}
</style>
