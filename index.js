const express = require('express')
var morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('postString', function getPostReq(req) {
    return req.postString
})

app.use(getPostString);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postString'))
app.use(express.static('dist'))

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const len = persons.length;
    const time = new Date();
    response.send(`
        <div>
            <p>Phonebook has info for ${len} people</p>
            <p>${time}</p>
        </div>
    `)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    console.log('Deleting id:', id);
    console.log('Before delete:', persons);

    persons = persons.filter(person => person.id !== id);

    console.log('After delete:', persons);
    response.status(204).end();
});

function generateId() {
    const minCeiled = Math.ceil(0);
    const maxFloored = Math.floor(999999);
    return String(Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled));
}


app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'missing required fields name or number'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    if (!persons.find(existingPerson => person.name === existingPerson.name)) {
        persons = persons.concat(person)
        response.json(person)
    }
    else {
        return response.status(400).json({
            error: `${body.name} is already in the phonebook!`
        })
    }
})

function getPostString(req, res, next) {
    req.postString = JSON.stringify(req.body);
    next();
}


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})