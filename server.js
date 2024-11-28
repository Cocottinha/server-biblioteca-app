const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const USERS_PATH = path.join(__dirname, 'users.json');
const BOOKS_PATH = path.join(__dirname, 'books.json');
const CUSER_PATH = path.join(__dirname, 'currentUser.json');
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

// Endpoints
// app.get('/books', (req, res) => {
//   const data = readUsers();
//   res.json(data);
// });

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

  // Add the new book
  data.books.push(newBook);

  // Write updated data back to the file
  writeJSON(BOOKS_PATH, data);

  res.status(200).send('Livro adicionado com sucesso!');
});


// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
