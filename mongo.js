const mongoose = require('mongoose')

const password = process.argv[2]
const personName = process.argv[3]
const personNumber = process.argv[4]

const url = `mongodb+srv://coder71:${password}@cluster0.pcmtb.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: personName,
  number: personNumber,
  date: new Date(),
})

if (process.argv.length === 5) {
  person.save().then((result) => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
} else if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    result.forEach((person) => console.log(person.name, person.number))
    mongoose.connection.close()
  })
}
