const https = require('https')
const {
    URL
} = require('url')

function forwardToAppsScript(payload, webhookUrl) {
    return new Promise((resolve, reject) => {
        const url = new URL(webhookUrl)
        const data = JSON.stringify(payload)

        const options = {
            method: 'POST',
            hostname: url.hostname,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }

        const req = https.request(options, (r) => {
            let body = ''
            r.on('data', chunk => body += chunk)
            r.on('end', () => resolve({
                status: r.statusCode,
                body
            }))
        })
        req.on('error', reject)
        req.write(data)
        req.end()
    })
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.statusCode = 405
        return res.end('Method Not Allowed')
    }

    const {
        name,
        email,
        currency
    } = req.body || {}
    if (!name || !email) {
        res.statusCode = 400
        return res.end(JSON.stringify({
            ok: false,
            error: 'name and email required'
        }))
    }

    const payload = {
        name,
        email,
        currency: currency || null,
        createdAt: new Date().toISOString()
    }

    try {
        if (process.env.SHEETS_WEBHOOK_URL) {
            const r = await forwardToAppsScript(payload, process.env.SHEETS_WEBHOOK_URL)
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({
                ok: true,
                upstream: r.status
            }))
        } else {
            // Modo sin Google: si el webhook no está configurado, igual responde OK
            console.log('[LEAD]', payload)
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({
                ok: true,
                stored: 'console'
            }))
        }
    } catch (e) {
        console.error('[LEAD ERROR]', e)
        res.statusCode = 500
        return res.end(JSON.stringify({
            ok: false,
            error: 'internal_error'
        }))
    }
}
