export async function fetchRate($axios, target) {
  const params = target ? { target } : {}
  const data = await $axios.$get('/api/rate', { params })
  return data
}
