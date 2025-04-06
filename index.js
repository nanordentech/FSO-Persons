require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const Person = require('./models/person')
const app = express()
app.use(express.static('dist'))
app.use(express.json())

morgan.token('postString', function getPostReq(req) {
    return req.postString
})

app.use(getPostString);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postString'))


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const time = new Date();
    Person.find({}).then(persons => {
        response.send(`
        <div>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${time}</p>
        </div>
    `)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
});

function generateId() {
    const minCeiled = Math.ceil(0);
    const maxFloored = Math.floor(999999);
    return String(Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled));
}


app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'missing required fields name or number'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId(),
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error, next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
    console.log(name, number)

    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                console.log('hi')
                return response.status(404).end()
            }
            person.name = name
            person.number = number

            return person.save().then((updatedPerson) => {
                response.json(updatedPerson)
            })
        })
        .catch(error => next(error))
})

function getPostString(req, res, next) {
    req.postString = JSON.stringify(req.body);
    next();
}


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    console.log(error.name)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}
app.use(errorHandler)