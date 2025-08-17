<script setup lang="ts">
import { ref, type Ref, toRef, watch } from 'vue'
import dayjs from 'dayjs'

import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import SelectButton from 'primevue/selectbutton'

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
  <!--  <p class="text-lg"># {{ event.id }} {{ event.name }}</p>-->
  <div class="molokoplus-event-editor">
    <div class="mt-0">
      <p>Start:</p>
      <div class="flex flex-wrap gap-2">
        <DatePicker
          v-if="isStartedAtEditable"
          class="w-20"
          v-model="startedAt"
          timeOnly
          @keydown.enter="updateStartedAt(startedAt)"
        />
        <Button v-if="isStartedAtEditable" label="OK" @click="updateStartedAt(startedAt)" />
        <template v-for="n in Array.from({ length: 5 }, (_, i) => -5 + i)" :key="n">
          <Button
            v-if="!isStartedAtEditable"
            :label="'' + n"
            severity="secondary"
            @click="updateStartedAt(addMinutes(n))"
          ></Button>
        </template>
        <Button
          v-if="!isStartedAtEditable"
          @click="isStartedAtEditable = true"
          icon="pi pi-pencil"
          severity="secondary"
        ></Button>
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
      <div class="flex flex-wrap gap-2">
        <DatePicker
          v-if="isEndedAtEditable"
          class="w-20"
          v-model="endedAt"
          timeOnly
          @keydown.enter="updateEndedAt(endedAt)"
        />
        <Button v-if="isEndedAtEditable" label="OK" @click="updateEndedAt(endedAt)" />
        <template v-for="n in Array.from({ length: 5 }, (_, i) => -5 + i)" :key="n">
          <Button
            v-if="!isEndedAtEditable"
            :label="'' + n"
            severity="secondary"
            @click="updateEndedAt(addMinutes(n))"
          ></Button>
        </template>
        <Button v-if="!isEndedAtEditable" label="Now" @click="updateEndedAt(addMinutes(0))" />
        <Button
          v-if="!isEndedAtEditable"
          @click="isEndedAtEditable = true"
          icon="pi pi-pencil"
          severity="secondary"
        ></Button>
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
