<script setup lang="ts">
import Button from 'primevue/button'

import TheNav from '@/components/TheNav.vue'
import TheEvent from '@/components/TheEvent.vue'
import { onMounted, ref, type Ref } from 'vue'
import { supabase } from '@/supabase.ts'

import dayjs, { Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

import type Event from '@/model/Event.ts'

dayjs.extend(duration)
dayjs.extend(utc)

const lastEvent: Ref<Event | null> = ref(null)
const eventsByDate: Ref<[Dayjs, Event[]][]> = ref([])

const selectedId: Ref<number | null> = ref(null)

const timeSinceLastEvent: Ref<string | null> = ref(null)

async function getEvents() {
  const { data } = await supabase
    .from('events')
    .select()
    .gte('started_at', dayjs().subtract(7, 'd').startOf('day').utc().toISOString())
    .order('id', { ascending: true })

  const allEvents = (data as Event[]) ?? []
  lastEvent.value = allEvents[allEvents.length - 1]

  eventsByDate.value = allEvents.reduce(
    (acc, event) => {
      const date = dayjs(event.started_at).startOf('day')
      const existing = acc.find(([d]) => d.diff() === date.diff())
      if (existing) {
        existing[1].push(event)
      } else {
        acc.push([date, [event]])
      }
      return acc
    },
    [] as [Dayjs, Event[]][],
  )

  if (selectedId.value === null && lastEvent.value.ended_at === null) {
    selectedId.value = lastEvent.value.id
  }
}

function getPreviousEvent(dayIndex: number, eventIndex: number) {
  if (dayIndex === 0 && eventIndex === 0) {
    return undefined
  }
  if (eventIndex === 0) {
    return eventsByDate.value[dayIndex - 1][1][eventsByDate.value[dayIndex - 1][1].length - 1]
  }
  return eventsByDate.value[dayIndex][1][eventIndex - 1]
}

function startEvent(type: string) {
  supabase
    .from('events')
    .insert({
      name: type,
      started_at: new Date().toISOString(),
    })
    .then(() => {
      getEvents()
    })
}

function onEditorUpdate(unselect: boolean) {
  console.log('unselect', unselect)
  if (unselect) {
    unselectEvent()
  }
  getEvents()
}

function selectEvent(index: number) {
  selectedId.value = index
}

function unselectEvent() {
  selectedId.value = null
}

function calculateTimeSinceLastEvent(): string {
  if (lastEvent.value === null) {
    return ''
  }
  return dayjs.duration(dayjs().diff(dayjs(lastEvent.value.started_at))).format('HH:mm:ss')
}

setInterval(() => {
  timeSinceLastEvent.value = calculateTimeSinceLastEvent()
}, 1000)

function age(to: Dayjs) {
  const ageDays = Math.floor(dayjs.duration(to.diff(dayjs('2024-12-05 14:35:00-05:00'))).asDays())
  return `${Math.floor(ageDays / 7)}w ${ageDays % 7}d`
}

onMounted(() => {
  getEvents()
})
</script>

<template>
  <TheNav />

  <div class="flex flex-col gap-3 mt-2">
    <div v-for="(day, dayIndex) in eventsByDate" :key="day[0].unix()">
      <div>
        <h1 class="ml-3 font-bold">
          {{ day[0].format('MMMM DD') }} -
          {{ age(dayjs(day[1][day[1].length - 1].started_at)) }} ({{ day[1].length }})
        </h1>
        <TheEvent
          v-for="(event, eventIndex) in day[1]"
          :key="event.id"
          :index="eventIndex + 1"
          :is-selected="selectedId === event.id"
          :event="event"
          :previous-event="getPreviousEvent(dayIndex, eventIndex)"
          @click-edit="selectEvent(event.id)"
          @click-close="unselectEvent()"
          @event-updated="onEditorUpdate($event)"
        />
      </div>
    </div>
  </div>

  <p class="mt-2 ml-3">Since last event: {{ timeSinceLastEvent }}</p>
  <div class="mt-2 ml-3 mb-3 flex gap-4">
    <Button icon="pi pi-refresh" severity="secondary" @click="getEvents()" />
    <Button label="Brestfeeding" @click="startEvent('brestfeeding')" />
  </div>
</template>
