<script setup lang="ts">
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { defineProps, onRenderTracked, onRenderTriggered, toRef } from 'vue'
import type Event from '@/model/Event.ts'
import dayjs from 'dayjs'

onRenderTracked((event) => {
  debugger
})

onRenderTriggered((event) => {
  debugger
})

const props = defineProps<{
  index: number
  event: Event
  previousEvent?: Event
}>()

const event = toRef(() => props.event)
// const brest = (event.value.properties?.brest as string[]) ?? []
const brest = toRef(() => (event.value.properties?.brest as string[]) ?? [])

const formatDate = (date: string) => dayjs(date).format('HH:mm')

const getMinutesDifference = (start: string, end: string) => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  return endDate.diff(startDate, 'minute')
}

const duration = (minutes: number) => {
  return dayjs.duration(minutes, 'minutes').format('HH:mm')
}
</script>

<template>
  <Card class="mt-2" pt:body:class="!py-2 !gap-1" pt:content:class="empty:hidden">
    <!--        <template #title># {{ event.id }} {{ event.name }}</template>-->
    <template #subtitle>
      <div class="flex items-center gap-2">
        <span>#{{ index }}</span>
        <span v-if="previousEvent">
          [^{{ duration(getMinutesDifference(previousEvent.started_at, event.started_at)) }}]
        </span>
        <span v-if="event.ended_at">
          {{ formatDate(event.started_at) }} -
          {{ formatDate(event.ended_at) }}
        </span>
        <span v-else>{{ formatDate(event.started_at) }} - In progress</span>
        <span v-if="event.ended_at">
          [{{ duration(getMinutesDifference(event.started_at, event.ended_at)) }}]
        </span>

        <div v-if="brest.length > 0" class="flex gap-1">
          <Tag v-if="brest.includes('Left')" severity="success" value="L" />
          <Tag v-if="brest.includes('Right')" severity="info" value="R" />
        </div>
      </div>
    </template>
    <!--    <template #content>-->
    <!--      <div v-if="props.event.properties?.brest?.length > 0" class="flex gap-1">-->
    <!--        <Tag v-if="props.event.properties.brest.includes('Left')" severity="success" value="Left" />-->
    <!--        <Tag v-if="props.event.properties.brest.includes('Right')" severity="info" value="Right" />-->
    <!--      </div>-->
    <!--    </template>-->
  </Card>
</template>
