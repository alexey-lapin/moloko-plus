import './assets/tailwind.css'
import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'
import { definePreset } from '@primeuix/themes'

const app = createApp(App)

const preset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      dark: {
        content: {
          background: '{surface.950}',
        }
      },
    },
  },
})

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: preset,
    options: {
      darkModeSelector: '.dark',
    },
  },
})

app.mount('#app')
