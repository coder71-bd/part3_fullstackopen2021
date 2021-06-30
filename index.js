require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

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
app.use(express.static('build'))

//info of all persons
app.get('/info', (request, response) => {
  const currentDate = new Date()
  const data = `<div>Phonebook has info for ${Person.length} people</div>
  <div>${currentDate}</div>`
  response.send(data)
})

//get all persons data from database
app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

//find an individual person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person)
    })
    .catch((error) => next(error))
})

//delete a person from the database
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

//add a person to the database
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ error: 'please specify name or number' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  //update the personDataOnPost to show the message in console using morgan middleware
  personDataOnPost = {
    name: body.name,
    number: body.number,
  }

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

//update a person
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error))
})

//unknown endpoint error handler
const unknownEndPoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndPoint)

//request error handler
const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformated id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
