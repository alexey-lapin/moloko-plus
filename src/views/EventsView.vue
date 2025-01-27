<script setup lang="ts">
import Button from 'primevue/button'

import TheNav from '@/components/TheNav.vue'
import { computed, onMounted, ref, type Ref } from 'vue'
import { supabase } from '@/supabase.ts'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

import type Event from '@/model/Event.ts'
import TheEvent from '@/components/TheEvent.vue'
import EventEditor from '@/components/EventEditor.vue'

dayjs.extend(duration)
dayjs.extend(utc)

const events: Ref<Event[]> = ref([])
const allEvents: Ref<Event[]> = ref([])

const selectedIndex: Ref<number | null> = ref(null)
const selectedEvent = computed(() => {
  return selectedIndex.value === null ? null : allEvents.value[selectedIndex.value]
})

const timeSinceLastEvent = ref()

async function getEvents() {
  const { data: todayData } = await supabase
    .from('events')
    .select()
    .gte('started_at', dayjs().startOf('day').utc().toISOString())
    .order('id', { ascending: true })

  const { data: previousData } = await supabase
    .from('events')
    .select()
    .lt('started_at', dayjs().startOf('day').utc().toISOString())
    .order('id', { ascending: false })
    .limit(1)

  events.value = (todayData as Event[]) ?? []
  allEvents.value = ((previousData as Event[]) ?? []).concat(events.value)
  const lastEvent = allEvents.value[allEvents.value.length - 1]

  if (selectedIndex.value === null && lastEvent.ended_at === null) {
    selectedIndex.value = allEvents.value.length - 1
  }
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

function getFormattedDate() {
  return dayjs().format('MMMM DD')
}

function onEditorUpdate(unselect: boolean) {
  console.log('unselect', unselect)
  if (unselect) {
    unselectEvent()
  }
  getEvents()
}

function selectEvent(index: number) {
  selectedIndex.value = index
}

function unselectEvent() {
  selectedIndex.value = null
}

function calculateTimeSinceLastEvent(): string {
  const lastEvent = allEvents.value[allEvents.value.length - 1]
  return dayjs.duration(dayjs().diff(dayjs(lastEvent.started_at))).format('HH:mm:ss')
}

setInterval(() => {
  timeSinceLastEvent.value = calculateTimeSinceLastEvent()
}, 1000)

function age() {
  const ageDays = Math.floor(
    dayjs.duration(dayjs().diff(dayjs('2024-12-05 14:35:00-05:00'))).asDays(),
  )
  return `${Math.floor(ageDays / 7)}w ${ageDays % 7}d`
}

onMounted(() => {
  getEvents()
})
</script>

<template>
  <TheNav />
  <div v-if="allEvents.length > 0">
    <h1 class="mt-4 ml-3 font-bold">{{ dayjs(allEvents[0].started_at).format('MMMM DD') }}</h1>
    <TheEvent :event="allEvents[0]" :index="0" :is-selected="false" />
  </div>
  <h1 class="mt-4 ml-3 font-bold">{{ getFormattedDate() }} - {{ age() }} ({{ events.length }})</h1>
  <div class="flex flex-col gap-4">
    <div v-if="allEvents.length > 0">
      <template v-for="index in allEvents.length">
        <TheEvent
          v-if="index > 1"
          :key="allEvents[index - 1].id"
          :index="index - 1"
          :is-selected="selectedIndex === index - 1"
          :event="allEvents[index - 1]"
          :previous-event="allEvents[index - 2]"
          @edit="selectEvent(index - 1)"
        />
      </template>
    </div>
    <p class="ml-3">Since last event: {{ timeSinceLastEvent }}</p>
    <div v-if="selectedEvent">
      <EventEditor
        :event="selectedEvent"
        @event-closed="unselectEvent"
        @event-updated="onEditorUpdate($event)"
      />
    </div>
    <div v-else class="ml-3">
      <Button label="Brestfeeding" @click="startEvent('brestfeeding')" />
    </div>
  </div>
</template>
