<script setup lang="ts">
import { computed, ref, type Ref, toRef, watch } from 'vue'
import dayjs from 'dayjs'

import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import SelectButton from 'primevue/selectbutton'
import Slider from 'primevue/slider'

import InputText from 'primevue/inputtext'
import type Event from '@/model/Event.ts'
import { supabase } from '@/supabase.ts'

const props = defineProps<{
  event: Event
}>()

const emits = defineEmits(['eventUpdated'])

const event = toRef(() => props.event)

const isStartedAtEditable = ref(false)
const isEndedAtEditable = ref(false)

const startedAt: Ref<Date | null> = ref(new Date(event.value.started_at))
const endedAt: Ref<Date | null> = ref(event.value.ended_at ? new Date(event.value.ended_at) : null)

const tags = ref((event.value.properties?.brest as string[]) ?? [])
const comment = ref((event.value.properties?.comment as string) ?? null)

const tagOptions = ref([
  { value: 'Left', class: 'left' },
  { value: 'Right', class: 'right' },
  {
    value: 'D3',
    class: 'd3',
  },
])

const addMinutes = (minutes: number) => {
  return dayjs().add(minutes, 'minute').toDate()
}

const updateStartedAt = (date: Date | null) => {
  if (date === null) {
    return
  }
  if (event.value.started_at != date.toISOString()) {
    updateEvent(false, {
      started_at: date.toISOString(),
    })
  }
  isStartedAtEditable.value = false
}

const updateEndedAt = (date: Date | null) => {
  if (date === null) {
    return
  }
  updateEvent(true, {
    ended_at: date.toISOString(),
  })
}

const updateEvent = (unselect: boolean, properties: Record<string, unknown>) => {
  supabase
    .from('events')
    .update(properties)
    .eq('id', event.value.id)
    .then(() => {
      emits('eventUpdated', unselect)
    })
}

const originalStartedAt = dayjs(startedAt.value).hour() * 60 + dayjs(startedAt.value).minute()
const originalEndedAt = dayjs(endedAt.value).hour() * 60 + dayjs(endedAt.value).minute()

const startedAtMinutes = computed({
  get: () => dayjs(startedAt.value).hour() * 60 + dayjs(startedAt.value).minute(),
  set: (val: number) => {
    startedAt.value = dayjs().startOf('day').add(val, 'minute').toDate()
  },
})

const endedAtMinutes = computed({
  get: () => dayjs(endedAt.value).hour() * 60 + dayjs(endedAt.value).minute(),
  set: (val: number) => {
    endedAt.value = dayjs().startOf('day').add(val, 'minute').toDate()
  },
})

watch(
  () => event.value,
  (newValue, oldValue) => {
    if (newValue) {
      startedAt.value = new Date(newValue.started_at)
      endedAt.value = newValue.ended_at ? new Date(newValue.ended_at) : null
      tags.value = (newValue.properties?.brest as string[]) ?? []
      comment.value = (newValue.properties?.comment as string) ?? null
    }
    if (oldValue.id !== newValue.id) {
      isStartedAtEditable.value = false
    }
  },
)
</script>

<template>
  <div class="molokoplus-event-editor">
    <div class="mt-0">
      <p>Start:</p>
      <div
        v-if="isStartedAtEditable"
        class="flex flex-col gap-5"
      >
        <div class="flex flex-wrap gap-2">
          <DatePicker
            class="w-25"
            v-model="startedAt"
            time-only
            hour-format="12"
            @keydown.enter="updateStartedAt(startedAt)"
          />
          <Button
            label="OK"
            @click="updateStartedAt(startedAt)"
          />
          <Button
            icon="pi pi-arrow-left"
            severity="secondary"
            @click="isStartedAtEditable = false"
          />
        </div>
        <Slider
          v-model="startedAtMinutes"
          :min="Math.max(0, originalStartedAt - 60 * 3)"
          :max="originalStartedAt"
          class="sm:w-56 w-full"
        />
      </div>
      <div
        v-else
        class="flex flex-wrap gap-2"
      >
        <template
          v-for="n in [-10, -7, -5, -1, 0]"
          :key="n"
        >
          <Button
            :label="'' + n"
            severity="secondary"
            @click="updateStartedAt(addMinutes(n))"
          />
        </template>
        <Button
          icon="pi pi-pencil"
          severity="secondary"
          @click="isStartedAtEditable = true"
        />
      </div>
    </div>

    <div class="mt-2">
      <p>Tags:</p>
      <SelectButton
        v-model="tags"
        :options="tagOptions"
        data-key="value"
        option-label="value"
        option-value="value"
        multiple
        @change="
          updateEvent(false, {
            properties: {
              ...event.properties,
              brest: tags,
            },
          })
        "
      >
        <template #option="slotProps">
          <span :class="slotProps.option.class">{{ slotProps.option.value }}</span>
        </template>
      </SelectButton>
    </div>

    <div class="mt-2">
      <p>End:</p>
      <div
        v-if="isEndedAtEditable"
        class="flex flex-col gap-5"
      >
        <div class="flex flex-wrap gap-2">
          <DatePicker
            class="w-25"
            v-model="endedAt"
            time-only
            hour-format="12"
            @keydown.enter="updateEndedAt(endedAt)"
          />
          <Button
            label="OK"
            @click="updateEndedAt(endedAt)"
          />
          <Button
            icon="pi pi-arrow-left"
            severity="secondary"
            @click="isEndedAtEditable = false"
          />
        </div>
        <Slider
          v-model="endedAtMinutes"
          :min="Math.max(0, originalEndedAt - 60 * 3)"
          :max="originalEndedAt"
          class="sm:w-56 w-full"
        />
      </div>

      <div
        v-else
        class="flex flex-wrap gap-2"
      >
        <template
          v-for="n in Array.from({ length: 5 }, (_, i) => -5 + i)"
          :key="n"
        >
          <Button
            :label="'' + n"
            severity="secondary"
            @click="updateEndedAt(addMinutes(n))"
          />
        </template>
        <Button
          label="Now"
          @click="updateEndedAt(addMinutes(0))"
        />
        <Button
          icon="pi pi-pencil"
          severity="secondary"
          @click="isEndedAtEditable = true"
        />
      </div>
    </div>

    <div class="mt-2 mb-2">
      <p>Comment:</p>
      <InputText
        v-model="comment"
        @change="
          updateEvent(false, {
            properties: {
              ...event.properties,
              comment,
            },
          })
        "
      />
    </div>
  </div>
</template>

<style>
.molokoplus-event-editor {
  .p-togglebutton-checked .p-togglebutton-content:has(.left) {
    background-color: var(--p-primary-100);
    color: var(--p-primary-700);
  }

  .p-togglebutton-checked .p-togglebutton-content:has(.right) {
    background-color: var(--p-sky-200);
    color: var(--p-sky-700);
  }

  .p-togglebutton-checked .p-togglebutton-content:has(.d3) {
    background-color: var(--p-orange-100);
    color: var(--p-orange-700);
  }
}

.dark .molokoplus-event-editor {
  .p-togglebutton-checked .p-togglebutton-content:has(.left) {
    background-color: rgb(216 180 254 / 0.35) !important;
    color: var(--p-purple-200) !important;
  }
}
</style>
