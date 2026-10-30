import colors from 'tailwindcss/colors'

const deprecated = new Set(['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'])
const palette = Object.fromEntries(Object.keys(colors).filter(name => !deprecated.has(name)).map(name => [name, colors[name]]))

export default { content:['./index.html','./src/**/*.{js,jsx}'],
theme:{ colors:{ ...palette, ink:'#080D1B', night:'#0C1426', cyan:{...colors.cyan,300:'#7BF0FF',400:'#00E5FF',500:'#00B8D2',600:'#008DA8'}, violet:{...colors.violet,300:'#D4A8FF',400:'#C27DFF',500:'#A855F7',600:'#8436D3',700:'#6223A5'}, volt:{400:'#A855F7',500:'#8436D3'} }, extend:{
fontFamily:{ display:['Poppins','sans-serif'], body:['Inter','sans-serif'] } } }, plugins:[] }
