const https = require('https')

const CACHE_TTL_MS = 60 * 1000 // 1 minute
let lastGood = null
let lastGoodAt = 0

function fetchRatesFromUpstream(target) {
  const base = 'USD'
  const upstreamUrl =
    process.env.RATE_API_URL ||
    `https://api.exchangerate.host/latest?base=${base}&symbols=${target}`

  return new Promise((resolve, reject) => {
    https
      .get(upstreamUrl, (response) => {
        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })
        response.on('end', () => {
          try {
            const json = JSON.parse(data)
            const rate = json?.rates?.[target]
            if (!rate) {
              return reject(new Error('Rate not found in upstream response'))
            }
            const asOf =
              json.date != null ? new Date(json.date).toISOString() : new Date().toISOString()

            resolve({ base, target, rate, asOf })
          } catch (err) {
            reject(err)
          }
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405
    return res.end('Method Not Allowed')
  }

  // Optional Query: ?base=USD&target=CLP
  const url = new URL(req.url, `http://${req.headers.host}`)
  const target = (url.searchParams.get('target') || 'CLP').toUpperCase()
  const now = Date.now()

  if (lastGood && lastGood.target === target && now - lastGoodAt < CACHE_TTL_MS) {
    res.setHeader('Content-Type', 'application/json')
    return res.end(
      JSON.stringify({
        ...lastGood,
        fromCache: true,
        source: 'cache'
      })
    )
  }

  try {
    const fresh = await fetchRatesFromUpstream(target)
    lastGood = { ...fresh, source: 'upstream' }
    lastGoodAt = now

    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ ...lastGood, fromCache: false }))
  } catch (err) {
    console.error('[RATE ERROR]', err)

    if (lastGood) {
      res.setHeader('Content-Type', 'application/json')
      return res.end(
        JSON.stringify({
          ...lastGood,
          fromCache: true,
          stale: true,
          source: 'cache-fallback'
        })
      )
    }
  }

  const mock = {
    base: 'USD',
    target,
    rate: 988,
    asOf: new Date().toISOString(),
    fromCache: false,
    source: 'mock'
  }

  res.setHeader('Content-Type', 'application/json')
  return res.end(JSON.stringify(mock))
}
