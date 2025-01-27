<script setup lang="ts">
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Card from 'primevue/card'
import SelectButton from 'primevue/selectbutton'
import InputText from 'primevue/inputtext'
import { ref, type Ref, toRef, watch } from 'vue'
import type Event from '@/model/Event.ts'
import { supabase } from '@/supabase.ts'
import dayjs from 'dayjs'

const props = defineProps<{
  event: Event
}>()

const emits = defineEmits(['eventClosed', 'eventUpdated'])

const event = toRef(() => props.event)

const isStartedAtEditable = ref(false)

const startedAt: Ref<Date | null> = ref(new Date(event.value.started_at))
const endedAt: Ref<Date | null> = ref(event.value.ended_at ? new Date(event.value.ended_at) : null)

const tags = ref((event.value.properties?.brest as string[]) ?? [])
const comment = ref((event.value.properties?.comment as string) ?? null)

const tagOptions = ref(['Left', 'Right', 'D3'])

const addMinutes = (minutes: number) => {
  return dayjs().add(minutes, 'minute').toDate()
}

const updateStartedAt = (date: Date | null) => {
  if (date === null) {
    return
  }
  updateEvent(false, {
    started_at: date.toISOString(),
  })
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
  <Card pt:body:class="">
    <template #title>
      <div class="flex items-center">
        <p class="flex-grow"># {{ event.id }} {{ event.name }}</p>
        <span class="pi pi-times" @click="emits('eventClosed')"></span>
      </div>
    </template>
    <template #content>
      <div>
        <Button
          v-if="!isStartedAtEditable"
          @click="isStartedAtEditable = true"
          label="Edit start"
          severity="secondary"
        ></Button>
        <div v-else>
          <p>Edit start:</p>
          <div class="flex flex-wrap gap-4">
            <DatePicker
              class="w-20"
              v-model="startedAt"
              timeOnly
              @keydown.enter="updateStartedAt(startedAt)"
            />
            <Button severity="secondary" label="OK" @click="updateStartedAt(startedAt)" />
            <template v-for="n in Array.from({ length: 5 }, (_, i) => -5 + i)" :key="n">
              <Button
                :label="'' + n"
                severity="secondary"
                @click="updateStartedAt(addMinutes(n))"
              ></Button>
            </template>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <p>Tags:</p>
        <SelectButton
          v-model="tags"
          :options="tagOptions"
          multiple
          @change="
            updateEvent(false, {
              properties: {
                ...event.properties,
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
            updateEvent(false, {
              properties: {
                ...event.properties,
                comment,
              },
            })
          "
        />
      </div>

      <div class="mt-2">
        <p>Edit end:</p>
        <div class="flex flex-wrap gap-4">
          <DatePicker
            class="w-20"
            v-model="endedAt"
            timeOnly
            @keydown.enter="updateEndedAt(endedAt)"
          />
          <Button severity="secondary" label="OK" @click="updateEndedAt(endedAt)" />
          <template v-for="n in Array.from({ length: 5 }, (_, i) => -5 + i)" :key="n">
            <Button
              :label="'' + n"
              severity="secondary"
              @click="updateEndedAt(addMinutes(n))"
            ></Button>
          </template>
          <Button label="Now" @click="updateEndedAt(addMinutes(0))" />
        </div>
      </div>
    </template>
  </Card>
</template>
