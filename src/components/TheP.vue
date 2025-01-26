<script setup lang="ts">
import { defineProps, isReactive, isRef, isProxy, toRef } from 'vue'
import type Event from '@/model/Event.ts'

const props = defineProps<{
  index: number
  event: Event
  previousEvent?: Event
}>()

console.log(`index isReactive ${isReactive(props.index)}`)
console.log(`index isRef ${isRef(props.index)}`)
console.log(`index isProxy ${isProxy(props.index)}`)
console.log(`event isReactive ${isReactive(props.event)}`)
console.log(`event isRef ${isRef(props.event)}`)
console.log(`event isProxy ${isProxy(props.event)}`)
console.log(`event id ${props.event.id}`)
const event = toRef(props, 'event')
</script>

<template>
  <p>{{ event.id }} {{ event.ended_at }} {{ event.properties }}</p>
</template>
