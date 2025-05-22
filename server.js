require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { OpenAI } = require('openai')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages
    })
    res.json({ content: response.choices[0].message.content })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})

