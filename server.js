const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data.json');
const cors = require('cors');
app.use(cors());
// Middleware
app.use(bodyParser.json());

// Helper para leitura/escrita de arquivo
function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Endpoints
app.get('/data', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/data', (req, res) => {
  const newData = req.body;
  writeData(newData);
  res.status(200).send('Dados atualizados!');
});
app.get('/users', (req, res) => {
    const data = readData();
    res.status(200).json(data.users || []);
  });
app.get('/logged', (req, res) => {
    const data = readData();
    res.status(200).json(data.currentUser || []);
});
app.post('/currentUser', (req, res) => {
    const data = readData();
    data.currentUser = req.body; // Armazena o usuário atual
    writeData(data);
    res.status(200).send('Usuário logado com sucesso');
  });
  
// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
