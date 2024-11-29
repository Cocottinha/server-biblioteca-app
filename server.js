const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const USERS_PATH = path.join(__dirname, 'users.json');
const BOOKS_PATH = path.join(__dirname, 'books.json');
const CUSER_PATH = path.join(__dirname, 'currentUser.json');
const RENT_BOOKS_PATH = path.join(__dirname, 'rentBooks.json');

const RENTAL_PERIOD_DAYS = 14; 

const cors = require('cors');

app.use(cors());

app.use(bodyParser.json());

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


app.post('/rentals', (req, res) => {
  const { bookId, userCpf, rentalDate } = req.body;

  if (!bookId || !userCpf || !rentalDate) {
    return res.status(400).send('Book ID, User CPF, and Rental Date are required.');
  }

  const data = readJSON(RENT_BOOKS_PATH);

  // Calculate return date
  const rentalDateObj = new Date(rentalDate);
  const returnDateObj = new Date(rentalDateObj);
  returnDateObj.setDate(rentalDateObj.getDate() + RENTAL_PERIOD_DAYS);

  // Format return date as YYYY-MM-DD
  const returnDate = returnDateObj.toISOString().split('T')[0];

  // Add rental record
  data.rentals.push({
    bookId,
    userCpf,
    rentalDate,
    returnDate,
  });

  writeJSON(RENT_BOOKS_PATH, data);
  res.status(200).send('Rental record added successfully!');
});

app.get('/rentals', (req, res) => {
  const data = readJSON(RENT_BOOKS_PATH);
  res.status(200).json(data.rentals || []);
});

app.patch('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10); // Parse `id` as a number
  const { availability } = req.body;

  console.log("id", id);
  console.log("a", availability);
  const data = readJSON(BOOKS_PATH);
  const book = data.books.find((b) => b.id === id);

  console.log(data.books[0].id);
  console.log("b", book);
  if (!book) {
    res.status(404).send('Livro não encontrado');
    return;
  }
  console.log(availability);
  book.availability = availability;
  writeJSON(BOOKS_PATH, data);
  res.status(200).send('Disponibilidade do livro atualizada com sucesso!');
});

app.post('/users', (req, res) => {
  const newUser = req.body;

  // Validate user data
  if (!newUser.name || !newUser.cpf || !newUser.email || !newUser.password || !newUser.role) {
    return res.status(400).send('Dados inválidos. Por favor, envie nome, CPF, email, senha e função.');
  }

  const data = readJSON(USERS_PATH);

  // Check for duplicate CPF
  if (data.users.some((user) => user.cpf === newUser.cpf)) {
    return res.status(409).send('Usuário com este CPF já está registrado.');
  }

  // Add the new user
  data.users.push(newUser);

  // Save the updated data
  writeJSON(USERS_PATH, data);

  res.status(201).send('Usuário cadastrado com sucesso.');
});


app.get('/users', (req, res) => {
  const data = readJSON(USERS_PATH);
  res.status(200).json(data.users || []);
});
// Endpoints para manipular o usuário logado
app.get('/logged', (req, res) => {
  const data = readJSON(CUSER_PATH);
  res.status(200).json(data || {});
});

app.post('/currentUser', (req, res) => {
  const currentUser = req.body;

  // Validate data structure
  if (!currentUser.name || !currentUser.cpf) {
    return res.status(400).send('Dados inválidos para o usuário atual.');
  }

  writeJSON(CUSER_PATH, currentUser);
  res.status(200).send('Usuário logado com sucesso!');
});


// Endpoints para manipular livros
app.get('/books', (req, res) => {
  const data = readJSON(BOOKS_PATH);
  res.status(200).json(data || { books: [] }); // Ensure the response is an object with a `books` array
});

app.post('/books', (req, res) => {
  const newBook = req.body;

  // Read existing data
  const data = readJSON(BOOKS_PATH);

  // Ensure `data.books` is an array
  if (!Array.isArray(data.books)) {
    data.books = [];
  }

  // Generate a unique ID for the new book
  const newId = data.books.length > 0 
    ? Math.max(...data.books.map((book) => parseInt(book.id || 0))) + 1 
    : 1;

  // Add the ID to the new book
  newBook.id = newId.toString();

  // Add the new book to the array
  data.books.push(newBook);

  // Write updated data back to the file
  writeJSON(BOOKS_PATH, data);

  res.status(200).send('Livro adicionado com sucesso!');
});



// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
