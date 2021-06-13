const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

//the variable will change when a post request become successfull
let personDataOnPost

const tiny = (tokens, req, res) => {
  const consoleBody = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
  ]
  return tokens.method(req, res) === 'POST'
    ? [...consoleBody, JSON.stringify(personDataOnPost)].join(' ')
    : [...consoleBody].join(' ')
}

//middlewares
app.use(express.json())
app.use(morgan(tiny))
app.use(cors())

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
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

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => person.id === id)
  person ? response.json(person) : response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((person) => person.id !== id)
  response.status(204).end()
})

//generate a random id for a successful post request data
const generateId = () => {
  return Math.random() * 10000000
}
app.post('/api/persons', (request, response) => {
  const body = request.body
  const duplicatePerson = persons.find((person) => person.name === body.name)

  //setting error based on name, number and duplication of name
  let error = !body.name
    ? { error: 'please provide name' }
    : !body.number
    ? { error: 'please provide number' }
    : duplicatePerson
    ? { error: 'name must be unique' }
    : ''

  if (error) {
    return response.status(400).json(error)
  }
  const person = {
    name: body.name,
    number: body.number,
    date: new Date(),
    id: generateId(),
  }

  //update the personDataOnPost to show the message in console using morgan middleware
  personDataOnPost = {
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
