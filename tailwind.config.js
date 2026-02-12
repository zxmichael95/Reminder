/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/renderer/index.html",
        "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#1f1f1f',
                primary: '#0ea5e9', // Blue
                success: '#73c991', // Green
                accent: '#a273d3',  // Purple
                warning: '#db9010', // Orange-ish
                highlight: '#f5f53b' // Yellow
            },
            // Override default colors if needed, or simply let `primary` etc. take precedence.
            // E.g. replace cyan with primary
        },
    },
    plugins: [],
}
