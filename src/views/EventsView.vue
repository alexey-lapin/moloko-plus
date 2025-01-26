<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import SelectButton from 'primevue/selectbutton'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'

import TheNav from '@/components/TheNav.vue'
import { onMounted, ref, type Ref } from 'vue'
import { supabase } from '@/supabase.ts'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

import type Event from '@/model/Event.ts'
import TheEvent from '@/components/TheEvent.vue'

dayjs.extend(duration)
dayjs.extend(utc)

const events: Ref<Event[]> = ref([])
const allEvents: Ref<Event[]> = ref([])

const inProgressEvent: Ref<Event | null> = ref(null)
const startTime: Ref<Date | null> = ref(null)
const endTime: Ref<Date | null> = ref(null)

const tags: Ref<[] | null> = ref(null)
const comment: Ref<string | null> = ref(null)

const options = ref(['Left', 'Right', 'D3'])

const timeSinceLastEvent = ref(0)
const timeSinceLastEvent2 = ref()

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

  if (lastEvent.ended_at) {
    inProgressEvent.value = null
  } else {
    inProgressEvent.value = lastEvent
  }

  tags.value = (allEvents.value[allEvents.value.length - 1].properties?.brest as []) ?? null
  comment.value =
    (allEvents.value[allEvents.value.length - 1].properties?.comment as string) ?? null

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

function updateStartedAt(id: number, started_at: Date | null) {
  if (started_at === null) {
    return
  }
  updateEvent(id, {
    started_at: started_at.toISOString(),
  })
  startTime.value = null
}

function endEvent(id: number, ended_at: Date | null) {
  if (ended_at === null) {
    return
  }
  supabase
    .from('events')
    .update({
      ended_at: ended_at.toISOString(),
    })
    .eq('id', id)
    .then(() => {
      getEvents()
    })
  endTime.value = null
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

function getMinutesDifference(date1: string, date2: string): number {
  const diffInMilliseconds = Math.abs(new Date(date2).getTime() - new Date(date1).getTime())
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
  return diffInMinutes
}

function getFormattedDate() {
  return dayjs().format('MMMM DD')
}

function minutesFromLastEvent() {
  const lastEvent = allEvents.value[allEvents.value.length - 1]
  return getMinutesDifference(lastEvent.started_at, new Date().toISOString())
}

function m(minutes: number): string {
  return dayjs.duration(minutes, 'm').format('HH:mm')
}

function selectEvent(index: number) {
  inProgressEvent.value = allEvents.value[index]
  tags.value = (allEvents.value[index].properties?.brest as []) ?? null
  comment.value = (allEvents.value[index].properties?.comment as string) ?? null
}

function unselectEvent() {
  inProgressEvent.value = null
  tags.value = null
  comment.value = null
}

setInterval(() => {
  timeSinceLastEvent.value = minutesFromLastEvent()
  timeSinceLastEvent2.value = m(timeSinceLastEvent.value)
}, 1000 * 60)

function addMinutes(minutes: number): Date {
  return dayjs().add(minutes, 'm').toDate()
}

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
    <h1 class="mt-4 font-bold">{{ dayjs(allEvents[0].started_at).format('MMMM DD') }}</h1>
    <TheEvent :event="allEvents[0]" :index="0" />
  </div>
  <h1 class="mt-4 font-bold">{{ getFormattedDate() }} - {{ age() }} ({{ events.length }})</h1>
  <div class="mt-4">
    <div v-if="allEvents.length > 0">
      <template v-for="index in allEvents.length">
        <TheEvent
          v-if="index > 1"
          :key="allEvents[index - 1].id"
          :index="index - 1"
          :event="allEvents[index - 1]"
          :previous-event="allEvents[index - 2]"
          @edit="selectEvent(index - 1)"
        />
      </template>
    </div>
    <div v-if="inProgressEvent" class="mt-4">
      <Card pt:body:class="">
        <template #title>
          <div class="flex items-center">
            <p class="flex-grow"># {{ inProgressEvent.id }} {{ inProgressEvent.name }}</p>
            <span class="pi pi-times" @click="unselectEvent"></span>
          </div>
        </template>
        <template #content>
          <div>
            <p>Started:</p>
            <div class="flex flex-wrap gap-4">
              <DatePicker
                class="w-20"
                v-model="startTime"
                timeOnly
                @keydown.enter="updateStartedAt(inProgressEvent.id, startTime)"
              />
              <Button
                severity="secondary"
                label="OK"
                @click="updateStartedAt(inProgressEvent.id, startTime)"
              />
              <template v-for="n in Array.from({ length: 9 }, (_, i) => -9 + i)" :key="n">
                <Button
                  :label="'' + n"
                  severity="secondary"
                  @click="updateStartedAt(inProgressEvent.id, addMinutes(n))"
                ></Button>
              </template>
            </div>
          </div>
          <div class="mt-2">
            <p>Tags:</p>
            <SelectButton
              v-model="tags"
              :options="options"
              multiple
              @change="
                updateEvent(inProgressEvent.id, {
                  properties: {
                    brest: tags,
                  },
                })
              "
            />
          </div>
          <div class="mt-2">
            <p>Comment:</p>
            <InputText
              v-model="comment"
              @change="
                updateEvent(inProgressEvent.id, {
                  properties: {
                    comment: comment,
                  },
                })
              "
            />
          </div>
          <div class="mt-2">
            <p>Stopped:</p>
            <div class="flex flex-wrap gap-4">
              <DatePicker
                class="w-20"
                v-model="endTime"
                timeOnly
                @keydown.enter="endEvent(inProgressEvent.id, endTime)"
              />
              <Button
                severity="secondary"
                label="OK"
                @click="endEvent(inProgressEvent.id, endTime)"
              />
              <template v-for="n in Array.from({ length: 9 }, (_, i) => -9 + i)" :key="n">
                <Button
                  :label="'' + n"
                  severity="secondary"
                  @click="endEvent(inProgressEvent.id, addMinutes(n))"
                ></Button>
              </template>
              <Button label="Now" @click="endEvent(inProgressEvent.id, addMinutes(0))" />
            </div>
          </div>
        </template>
      </Card>
    </div>
    <div v-else class="mt-4">
      <p class="mb-2">Since last event: {{ timeSinceLastEvent2 }}</p>
      <Button label="Brestfeeding" @click="startEvent('brestfeeding')" />
    </div>
  </div>
</template>

<style scoped></style>
