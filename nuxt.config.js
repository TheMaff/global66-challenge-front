export default {
    target: 'server', // SSR
    head: {
        titleTemplate: '%s · Global66',
        meta: [{
                charset: 'utf-8'
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            }
        ],
        link: [{
            rel: 'icon',
            type: 'image/png',
            href: '/favicon.png'
        }]
    },
    // buildModules: ['@nuxtjs/tailwindcss'],
    modules: ['@nuxtjs/axios'],
    axios: {
        baseURL: '/'
    },
    css: ['~/assets/tailwind.css'],
    serverMiddleware: [
        '~/server/middleware/logger.js', // LOG
        '~/server/middleware/body.js', // JSON
        { path: '/api/rates', handler: '~/server/api/rates.js' },
        { path: '/api/leads', handler: '~/server/api/leads.js' }
    ],
}
