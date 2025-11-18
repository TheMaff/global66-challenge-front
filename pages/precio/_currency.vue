<template>
  <main class="min-h-screen bg-white">
    <!-- Header simple -->
    <header class="bg-brand text-white">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="font-semibold">Global66</h1>
        <nav class="text-sm opacity-90">Personas · Empresas</nav>
      </div>
    </header>

    <!-- Hero tasa -->
    <section class="bg-brand text-white">
      <div class="max-w-6xl mx-auto py-10 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <p class="opacity-90 mb-2">Valor del dólar hoy</p>
          <h2 class="text-3xl md:text-4xl font-extrabold">1 USD = {{ formattedRate }}</h2>
          <p class="mt-2 text-sm opacity-90">Tipo de cambio para {{ asOfLocal }}</p>

          <!-- Form lead -->
          <form
            class="mt-6 bg-white text-gray-900 rounded-xl p-4 shadow-sm"
            @submit.prevent="submitLead"
          >
            <h3 class="font-semibold mb-3">¿Quieres que te contactemos?</h3>
            <div class="grid md:grid-cols-2 gap-3">
              <input
                v-model="lead.name"
                type="text"
                placeholder="Nombre"
                class="border rounded-md px-3 py-2"
                required
              />
              <input
                v-model="lead.email"
                type="email"
                placeholder="Email"
                class="border rounded-md px-3 py-2"
                required
              />
            </div>
            <button
              :disabled="submitting"
              class="mt-3 px-4 py-2 rounded-md bg-brand text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {{ submitting ? 'Enviando…' : 'Quiero más info' }}
            </button>
            <p v-if="sent" class="text-green-100 mt-2">¡Listo! Te contactamos pronto.</p>
          </form>
        </div>

        <!-- Imagen hero -->
        <div class="flex justify-center">
          <img src="/img/_preview.png" alt="App Global66" class="w-[360px] md:w-[420px]" />
        </div>
      </div>
    </section>

    <!-- Sección secundaria -->
    <section class="">
      <div
        class="bg-gray-50 max-w-6xl mx-auto md:mt-8 rounded-xl px-10 py-10 grid md:grid-cols-2 gap-8 items-center"
      >
        <div>
          <h3 class="text-2xl font-bold">Sé Global, paga como local</h3>
          <p class="text-gray-600 mt-2">
            Tu Cuenta Global para pagar, convertir, enviar dinero y más.
          </p>
          <div class="flex gap-3 mt-4">
            <img src="/img/playstore.svg" alt="Google Play" class="h-10" />
            <img src="/img/appstore.svg" alt="App Store" class="h-10" />
          </div>
        </div>
        <div class="flex justify-center">
          <img src="/img/banner-img.png" alt="Tarjeta y app" class="w-[420px]" />
        </div>
      </div>
    </section>

    <footer class="text-sm text-gray-500 py-8 text-center">© Global66 (demo técnica)</footer>
  </main>
</template>

<script>
import { slugToCurrency, currencyToLabel } from '~/utils/currency-map'
import { fetchRate } from '~/utils/fetch-rate'

export default {
  async asyncData({ params, $axios, error }) {
    const slug = params.currency
    const target = slugToCurrency[slug]

    // 1) Si el slug no existe, 404 real
    if (!target) {
      error({ statusCode: 404, message: 'Moneda no soportada' })
      return
    }

    // 2) Valores por defecto (fallback)
    let rate = 988
    let asOf = new Date().toISOString()

    try {
      if ($axios) {
        const data = await fetchRate($axios, target)
        if (data && typeof data.rate === 'number') {
          rate = data.rate
          asOf = data.asOf || asOf
        }
      }
    } catch (e) {
      // Importante: logueamos, pero NO llamamos a error()
      console.error('[asyncData rate error]', e)
    }

    return {
      slug,
      target,
      rate,
      asOf
    }
  },

  data() {
    return {
      lead: { name: '', email: '' },
      submitting: false,
      sent: false
    }
  },

  computed: {
    formattedRate() {
      const locale = this.target === 'CLP' ? 'es-CL' : this.target === 'PEN' ? 'es-PE' : 'es'
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: this.target
      }).format(this.rate)
    },
    asOfLocal() {
      try {
        return (
          new Intl.DateTimeFormat('es-CL', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'UTC'
          }).format(new Date(this.asOf)) + ' UTC'
        )
      } catch {
        return this.asOf
      }
    },
    currencyToLabel() {
      return currencyToLabel
    }
  },

  methods: {
    async submitLead() {
      this.submitting = true
      try {
        await this.$axios.$post('/api/leads', {
          ...this.lead,
          currency: this.target
        })
        this.sent = true
        this.lead = { name: '', email: '' }
      } catch (e) {
        alert('Error enviando el formulario')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
