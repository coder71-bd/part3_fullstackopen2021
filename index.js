const express = require('express')
const app = express()

const persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: '4',
    name: 'May Poppendick',
    number: '39-23-6423122',
  },
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})
app.get('/info', (request, response) => {
  const currentDate = new Date()
  const data = `<div>Phonebook has info for ${persons.length} people</div>
  <div>${currentDate}</div>`
  response.send(data)
})

const PORT = 3001

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
