import app from './index.js'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Cupboard API listening on http://localhost:${PORT}`)
})
