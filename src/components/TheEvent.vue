<script setup lang="ts">
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { defineProps } from 'vue'
import type Event from '@/model/Event.ts'
import dayjs from 'dayjs'

const props = defineProps<{
  index: number
  events: Event[]
}>()

const event = props.events[props.index]

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
        <span v-if="event.ended_at">
          {{ formatDate(event.started_at) }} -
          {{ formatDate(event.ended_at) }}
        </span>
        <span v-if="index > 0">[{{ duration(getMinutesDifference(events[index - 1].started_at, event.started_at)) }}]</span>
        <span v-if="event.ended_at">
          [{{ getMinutesDifference(event.started_at, event.ended_at) }}]
        </span>
        <p v-if="!event.ended_at">{{ formatDate(event.started_at) }} - In progress</p>

        <div v-if="event.properties?.brest?.length > 0" class="flex gap-1">
          <Tag v-if="event.properties.brest.includes('Left')" severity="success" value="Left" />
          <Tag v-if="event.properties.brest.includes('Right')" severity="info" value="Right" />
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
