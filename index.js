require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

//the variable will change when a post request become successfull
let personDataOnPost;

const tiny = (tokens, req, res) => {
  const consoleBody = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
  ];
  return tokens.method(req, res) === 'POST'
    ? [...consoleBody, JSON.stringify(personDataOnPost)].join(' ')
    : [...consoleBody].join(' ');
};

//middlewares
app.use(express.json());
app.use(morgan(tiny));
app.use(cors());
app.use(express.static('build'));

//get all person data from database
app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/info', (request, response) => {
  const currentDate = new Date();
  const data = `<div>Phonebook has info for ${Person.length} people</div>
  <div>${currentDate}</div>`;
  response.send(data);
});

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

//delete a person from the database
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (body.name === undefined || body.number === undefined) {
    return response
      .status(400)
      .json({ error: 'please specify name or number' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  //update the personDataOnPost to show the message in console using morgan middleware
  personDataOnPost = {
    name: body.name,
    number: body.number,
  };

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
