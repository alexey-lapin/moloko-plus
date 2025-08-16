<script setup lang="ts">
import Button from 'primevue/button'
import { Menubar } from 'primevue'
import { useSessionStore } from '@/stores/session.ts'
import type { MenuItem } from 'primevue/menuitem'
import { useColorMode, useCycleList } from '@vueuse/core'
import { computed, watchEffect } from 'vue'

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
    <!--    <template #item="{ item, props, hasSubmenu, root }">-->
    <!--      <a v-ripple class="flex items-center" v-bind="props.action">-->
    <!--        <span>{{ item.label }}</span>-->
    <!--        <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />-->
    <!--        <span v-if="item.shortcut" class="ml-auto border border-surface rounded-sm bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>-->
    <!--        <i v-if="hasSubmenu" :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"></i>-->
    <!--      </a>-->
    <!--    </template>-->
    <template #end>
      <div class="flex items-center gap-2">
        <!--        <Avatar image="/images/avatar/amyelsner.png" shape="circle" />-->
        <Button :icon="modeIcon" text severity="secondary" @click="next()" />
        <Button label="Logout" severity="secondary" @click="sessionStore.logout()" />
      </div>
    </template>
  </Menubar>
</template>
