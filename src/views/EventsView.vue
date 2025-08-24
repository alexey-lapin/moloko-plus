<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

import Button from 'primevue/button'

import TheNav from '@/components/TheNav.vue'
import TheEvent from '@/components/TheEvent.vue'

import { supabase } from '@/supabase.ts'

import type Event from '@/model/Event.ts'

dayjs.extend(duration)
dayjs.extend(utc)

const lastEvent: Ref<Event | null> = ref(null)
const eventsByDate: Ref<[Dayjs, Event[]][]> = ref([])

const selectedId: Ref<number | null> = ref(null)

const timeSinceLastEvent: Ref<string | null> = ref(null)

const creatingEvent: Ref<boolean> = ref(false)
const refreshingEvents: Ref<boolean> = ref(false)

async function getEvents() {
  refreshingEvents.value = true
  try {
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
        const existing = acc.find(([d]) => d.unix() === date.unix())
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
  } finally {
    refreshingEvents.value = false
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

async function startEvent(type: string) {
  try {
    creatingEvent.value = true
    const { data } = await supabase
      .from('events')
      .select('properties')
      .limit(1)
      .order('id', { ascending: false })
    const prevTags: string[] = data?.[0]?.properties?.brest ?? []
    const tags: string[] = []
    if (prevTags.includes('Left')) {
      tags.push('Right')
    } else if (prevTags.includes('Right')) {
      tags.push('Left')
    }
    await supabase
      .from('events')
      .insert({
        name: type,
        started_at: new Date().toISOString(),
        properties: tags.length > 0 ? { brest: tags } : null,
      })
      .then(() => {
        return getEvents()
      })
      .then(() => {
        scrollToBottom()
      })
      .then(() => {
        sendMessageToBot({ event: lastEvent.value, start: true })
      })
  } finally {
    creatingEvent.value = false
  }
}

function onEditorUpdate(dayIndex: number, eventIndex: number, unselect: boolean) {
  if (unselect) {
    unselectEvent()
  }
  getEvents().then(() => {
    if (unselect) {
      sendMessageToBot({ event: eventsByDate.value[dayIndex][1][eventIndex], start: false })
    }
  })
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

function age(to: Dayjs) {
  const ageDays = Math.floor(dayjs.duration(to.diff(dayjs('2024-12-05 00:00:00-05:00'))).asDays())
  return `${Math.floor(ageDays / 7)}w ${ageDays % 7}d`
}

function sendMessageToBot(botMessage: { event: Event | null; start: boolean }) {
  let message: string
  if (botMessage.start) {
    message = `#${botMessage.event?.id} ${botMessage.event?.name} started at ${dayjs(botMessage.event?.started_at).format('HH:mm')}`
  } else {
    message = `#${botMessage.event?.id} ${botMessage.event?.name} ended at ${dayjs(botMessage.event?.ended_at).format('HH:mm')}`
  }
  supabase.functions
    .invoke('bot-send', {
      body: JSON.stringify({ name: message }),
    })
    .then((res) => {
      console.log(res)
    })
}

function scrollToBottom() {
  const el = document.getElementById('bottom')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  getEvents().then(() => {
    scrollToBottom()
  })
  timer = setInterval(() => {
    timeSinceLastEvent.value = calculateTimeSinceLastEvent()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="min-h-screen">
    <TheNav />

    <div class="safe-area-content">
      <div class="flex flex-col gap-6 mt-2">
        <div
          v-for="(day, dayIndex) in eventsByDate"
          :key="day[0].unix()"
        >
          <div>
            <div class="flex items-center gap-2 min-h-7">
              <h1 class="ml-3 font-bold">
                {{ day[0].format('MMMM DD') }} -
                {{ age(dayjs(day[1][day[1].length - 1].started_at)) }} ({{ day[1].length }})
              </h1>
            </div>

            <div class="flex flex-col gap-0.5">
              <TheEvent
                v-for="(event, eventIndex) in day[1]"
                :key="event.id"
                :index="eventIndex + 1"
                :is-selected="selectedId === event.id"
                :event="event"
                :previous-event="getPreviousEvent(dayIndex, eventIndex)"
                @click-edit="selectEvent(event.id)"
                @click-close="unselectEvent()"
                @event-updated="onEditorUpdate(dayIndex, eventIndex, $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <p
        v-if="!selectedId"
        class="mt-2 ml-3"
      >
        Since last event: {{ timeSinceLastEvent }}
      </p>

      <div class="mt-3 ml-3 mb-10 flex gap-4">
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          :loading="refreshingEvents"
          @click="getEvents()"
        />
        <Button
          label="Breastfeeding"
          :severity="selectedId ? 'secondary' : 'primary'"
          :loading="creatingEvent"
          @click="startEvent('brestfeeding')"
        />
      </div>

      <div id="bottom"></div>
    </div>
  </div>
</template>

<style scoped>
.safe-area-content {
  padding-top: calc(5rem + env(safe-area-inset-top));
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  padding-bottom: max(2.5rem, env(safe-area-inset-bottom));
}
</style>
