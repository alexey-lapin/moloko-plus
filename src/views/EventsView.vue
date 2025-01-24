<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import SelectButton from 'primevue/selectbutton'
import TheNav from '@/components/TheNav.vue'
import { onMounted, ref, type Ref } from 'vue'
import { supabase } from '@/supabase.ts'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import type Event from '@/model/Event.ts'
import TheEvent from '@/components/TheEvent.vue'

const events: Ref<Event[]> = ref([
  // {
  //   id: 1,
  //   name: 'brestfeeding',
  //   started_at: new Date().toISOString(),
  //   ended_at: new Date().toISOString(),
  // },
  // {
  //   id: 2,
  //   name: 'brestfeeding',
  //   started_at: new Date().toISOString(),
  //   ended_at: new Date().toISOString(),
  // },
  // {
  //   id: 3,
  //   name: 'brestfeeding',
  //   started_at: new Date().toISOString(),
  // },
])
const allEvents: Ref<Event[]> = ref([])

dayjs.extend(duration)
dayjs.extend(utc)

const isInProgress = ref(false)

const inProgessEvent: Ref<Event> = ref()

const brest: Ref<[] | null> = ref(null)

const options = ref(['Left', 'Right'])

const timeSinceLastEvent = ref(0)
const timeSinceLastEvent2 = ref()

async function getEvents() {
  const { data: todayData } = await supabase
    .from('events')
    .select()
    .gte('started_at', dayjs().startOf('day').utc().toISOString())
    .order('id', { ascending: true })

  const { data: previosData } = await supabase
    .from('events')
    .select()
    .lt('started_at', dayjs().startOf('day').utc().toISOString())
    .order('id', { ascending: false })
    .limit(1)

  events.value = todayData
  allEvents.value = previosData.concat(todayData)
  console.log(events.value)
  isInProgress.value =
    allEvents.value[allEvents.value.length - 1].ended_at === undefined ||
    allEvents.value[allEvents.value.length - 1].ended_at === null
  inProgessEvent.value = allEvents.value[allEvents.value.length - 1]
  brest.value = allEvents.value[allEvents.value.length - 1].properties?.brest ?? null

  timeSinceLastEvent.value = minutesFromLastEvent()
  timeSinceLastEvent2.value = m(timeSinceLastEvent.value)
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

function endEvent(id: number, ended_at: Date) {
  supabase
    .from('events')
    .update({
      ended_at: ended_at.toISOString(),
    })
    .eq('id', id)
    .then(() => {
      getEvents()
    })
}

function updateEvent(id: number, properties: Record<string, unknown>) {
  supabase
    .from('events')
    .update(properties)
    .eq('id', id)
    .then(() => {
      getEvents()
    })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const pad = (num: number) => num.toString().padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1) // Months are 0-indexed
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  // return `${year}-${month}-${day} ${hours}:${minutes}`
  return `${hours}:${minutes}`
}

function getMinutesDifference(date1: string, date2: string): number {
  const diffInMilliseconds = Math.abs(new Date(date2).getTime() - new Date(date1).getTime())
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
  return diffInMinutes
}

// textual month and day
function getFormattedDate() {
  const date = new Date()
  const options = { month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

function minutesFromLastEvent() {
  const lastEvent = allEvents.value[allEvents.value.length - 1]
  return getMinutesDifference(lastEvent.started_at, new Date().toISOString())
}

function m(minutes: number): string {
  return dayjs.duration(minutes, 'm').format('HH:mm')
}

setInterval(() => {
  timeSinceLastEvent.value = minutesFromLastEvent()
  timeSinceLastEvent2.value = m(timeSinceLastEvent.value)
}, 1000 * 60)

function addMinutes(minutes: number): Date {
  return dayjs().add(minutes, 'm').toDate()
}

onMounted(() => {
  getEvents()
})
</script>

<template>
  <TheNav />
  <div v-if="allEvents.length > 0">
    <h1 class="mt-4">{{ dayjs(allEvents[0].started_at).format('MMMM DD') }}</h1>
    <TheEvent :events="allEvents" :index="0" />
  </div>
  <h1 class="mt-4">{{ getFormattedDate() }} ({{ events.length }})</h1>
  <div class="mt-4">
    <div v-if="allEvents.length > 0">
      <TheEvent
        v-for="index in allEvents.length - 1"
        :key="index"
        :events="allEvents"
        :index="index"
      />
    </div>
    <div v-if="isInProgress" class="mt-4">
      <Card pt:body:class="">
        <template #title># {{ inProgessEvent.id }} {{ inProgessEvent.name }}</template>
        <template #content>
          <div>
            <p>Started:</p>
            <div class="flex gap-4">
              <Button label="-10" severity="secondary"></Button>
              <Button label="-9" severity="secondary"></Button>
              <Button label="-8" severity="secondary"></Button>
              <Button label="-7" severity="secondary"></Button>
              <Button label="-6" severity="secondary"></Button>
              <Button label="-5" severity="secondary"></Button>
              <Button label="-4" severity="secondary"></Button>
              <Button label="-3" severity="secondary"></Button>
              <Button label="-2" severity="secondary"></Button>
              <Button label="-1" severity="secondary"></Button>
            </div>
          </div>
          <div class="mt-2">
            <p>Brest:</p>
            <SelectButton
              v-model="brest"
              :options="options"
              multiple
              @change="
                updateEvent(inProgessEvent.id, {
                  properties: {
                    brest: brest,
                  },
                })
              "
            />
          </div>
          <div class="mt-2">
            <p>Stopped:</p>
            <div class="flex gap-4">
              <Button
                label="-10"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-10))"
              ></Button>
              <Button
                label="-9"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-9))"
              ></Button>
              <Button
                label="-8"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-8))"
              ></Button>
              <Button
                label="-7"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-7))"
              ></Button>
              <Button
                label="-6"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-6))"
              ></Button>
              <Button
                label="-5"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-5))"
              ></Button>
              <Button
                label="-4"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-4))"
              ></Button>
              <Button
                label="-3"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-3))"
              ></Button>
              <Button
                label="-2"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-2))"
              ></Button>
              <Button
                label="-1"
                severity="secondary"
                @click="endEvent(inProgessEvent.id, addMinutes(-1))"
              ></Button>
              <Button label="Now" @click="endEvent(inProgessEvent.id, addMinutes(0))" />
            </div>
          </div>
        </template>
      </Card>
    </div>
    <div v-else class="mt-4">
      <p class="mb-2">Since last: {{ timeSinceLastEvent2 }}</p>
      <Button label="Brestfeeding" @click="startEvent('brestfeeding')" />
    </div>
  </div>
</template>

<style scoped></style>
