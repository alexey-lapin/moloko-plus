<script setup lang="ts">
import Button from 'primevue/button'
import { Menubar } from 'primevue'
import { useSessionStore } from '@/stores/session.ts'
import type { MenuItem } from 'primevue/menuitem'

const sessionStore = useSessionStore()

const items : MenuItem[] = []
</script>

<template>
  <Menubar :model="items">
    <template #start>
      <h1>Track</h1>
    </template>
<!--    <template #item="{ item, props, hasSubmenu, root }">-->
<!--      <a v-ripple class="flex items-center" v-bind="props.action">-->
<!--        <span>{{ item.label }}</span>-->
<!--        <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />-->
<!--        <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>-->
<!--        <i v-if="hasSubmenu" :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"></i>-->
<!--      </a>-->
<!--    </template>-->
    <template #end>
<!--      <div class="flex items-center gap-2">-->
<!--        <Avatar image="/images/avatar/amyelsner.png" shape="circle" />-->
<!--      </div>-->
      <Button label="Logout" @click="sessionStore.logout()"/>
    </template>
  </Menubar>
</template>
