<script setup lang="ts">
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { onMounted, onUnmounted, ref, toRef } from 'vue'
import type Event from '@/model/Event.ts'
import dayjs from 'dayjs'
import EventEditor from '@/components/EventEditor.vue'

const props = defineProps<{
  index: number
  isSelected: boolean
  event: Event
  previousEvent?: Event
}>()

const emits = defineEmits(['click-edit', 'click-close', 'event-updated'])

const event = toRef(() => props.event)
const tags = toRef(() => (event.value.properties?.brest as string[]) ?? [])
const comment = toRef(() => (event.value.properties?.comment as string) ?? null)

const formatDate = (date: string) => dayjs(date).format('hh:mm')

const getMinutesDifference = (start: string, end: string) => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  return endDate.diff(startDate, 'minute')
}

const duration = (minutes: number, format: string) => {
  return dayjs.duration(minutes, 'minutes').format(format)
}

const composeLine = () => {
  return (
    (event.value.ended_at
      ? `${formatDate(event.value.started_at)} - ${formatDate(event.value.ended_at)}`
      : `${formatDate(event.value.started_at)} - In progress`) +
    (props.previousEvent
      ? ` [${duration(getMinutesDifference(props.previousEvent.started_at, event.value.started_at), 'HH:mm')}; `
      : '[') +
    (event.value.ended_at
      ? `${duration(getMinutesDifference(event.value.started_at, event.value.ended_at), 'mm')}]`
      : props.isSelected
        ? `${timeSinceStart.value}]`
        : ']')
  )
}

const timeSinceStart = ref<string | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (props.isSelected) {
    timer = setInterval(() => {
      timeSinceStart.value = dayjs
        .duration(dayjs().diff(dayjs(event.value.started_at)))
        .format('mm:ss')
    })
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <Card
    :class="`mt-2 ${isSelected ? 'border border-teal-600' : ''}`"
    pt:body:class="!py-2 !gap-1"
    pt:content:class="empty:hidden"
  >
    <template #content>
      <div class="flex items-center">
        <div :class="`flex-grow flex flex-wrap items-center gap-2 ${isSelected ? 'text-lg' : ''}`">
          <span class="font-bold">{{ index }}</span>

          <span>{{ composeLine() }}</span>

          <div v-if="tags.length > 0" class="flex gap-1">
            <Tag
              v-if="tags.includes('Left')"
              severity="success"
              value="L"
              class="dark:!bg-purple-300/35 dark:!text-white"
            />
            <Tag v-if="tags.includes('Right')" severity="info" value="R" />
            <Tag v-if="tags.includes('D3')" severity="warn" value="D3" />
          </div>
          <span v-if="comment" class="text-muted-color">{{ comment }}</span>
        </div>
        <span v-if="isSelected" class="pi pi-times" @click="emits('click-close')"></span>
        <span v-else class="cursor-pointer pi pi-pencil p-1" @click="emits('click-edit')"></span>
      </div>
      <div v-if="isSelected">
        <EventEditor :event="event" @event-updated="emits('event-updated', $event)" />
      </div>
    </template>
  </Card>
</template>
