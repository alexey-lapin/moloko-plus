<script setup lang="ts">
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { toRef } from 'vue'
import type Event from '@/model/Event.ts'
import dayjs from 'dayjs'

const props = defineProps<{
  index: number
  isSelected: boolean
  event: Event
  previousEvent?: Event
}>()

const emits = defineEmits(['edit'])

const event = toRef(() => props.event)
const tags = toRef(() => (event.value.properties?.brest as string[]) ?? [])
const comment = toRef(() => (event.value.properties?.comment as string) ?? null)

const formatDate = (date: string) => dayjs(date).format('HH:mm')

const getMinutesDifference = (start: string, end: string) => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  return endDate.diff(startDate, 'minute')
}

const duration = (minutes: number, format: string) => {
  return dayjs.duration(minutes, 'minutes').format(format)
}
</script>

<template>
  <Card :class="`mt-2 ${isSelected ? 'border border-teal-600' : ''}`" pt:body:class="!py-2 !gap-1" pt:content:class="empty:hidden">
    <!--        <template #title># {{ event.id }} {{ event.name }}</template>-->
    <template #content>
      <div class="flex items-center">
        <div class="flex-grow flex flex-wrap items-center gap-2 font-mono1">
          <span class="font-bold">{{ index }}</span>

          <span v-if="event.ended_at">
            {{ formatDate(event.started_at) }} -
            {{ formatDate(event.ended_at) }}
          </span>
          <span v-else>{{ formatDate(event.started_at) }} - In progress</span>

          <span v-if="previousEvent">
            [{{
              duration(getMinutesDifference(previousEvent.started_at, event.started_at), 'HH:mm')
            }};
          </span>
          <span v-else>[</span>
          <span v-if="event.ended_at">
            {{ duration(getMinutesDifference(event.started_at, event.ended_at), 'mm') }}]
          </span>
          <span v-else>]</span>

          <div v-if="tags.length > 0" class="flex gap-1">
            <Tag v-if="tags.includes('Left')" severity="success" value="L" />
            <Tag v-if="tags.includes('Right')" severity="info" value="R" />
            <Tag v-if="tags.includes('D3')" severity="warn" value="D3" />
          </div>
          <span v-if="comment" class="text-muted-color">{{ comment }}</span>
        </div>
        <span class="pi pi-pencil" @click="emits('edit')"></span>
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
