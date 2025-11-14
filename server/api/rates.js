module.exports = (req, res) => {
    if (req.method !== 'GET') {
        res.statusCode = 405
        return res.end('Method Not Allowed')
    }

    // Optional Query: ?base=USD&target=CLP
    const url = new URL(req.url, `http://${req.headers.host}`)
    const base = (url.searchParams.get('base') || 'USD').toUpperCase()
    const target = (url.searchParams.get('target') || '').toUpperCase()

    // Mock
    const table = {
        USD: {
            CLP: 987.62,
            PEN: 3.81,
            USD: 1
        }
    }

    // Validation
    if (!table[base]) {
        res.statusCode = 400
        return res.end(JSON.stringify({
            ok: false,
            error: 'unsupported_base'
        }))
    }
    const rates = table[base]
    const asOf = new Date().toISOString()

    if (target) {
        const val = rates[target]
        if (!val) {
            res.statusCode = 404
            return res.end(JSON.stringify({
                ok: false,
                error: 'target_not_found'
            }))
        }
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({
            base,
            rates: {
                [target]: val
            },
            asOf
        }))
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
        base,
        rates,
        asOf
    }))
}
