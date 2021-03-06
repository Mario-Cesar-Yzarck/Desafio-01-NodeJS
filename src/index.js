const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');//?

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({error: 'User not found!'});
  }

  request.user = user;

  return next()
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if(userAlreadyExists) {
    return response.status(404).json({error: 'Mensagem de error'});
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;    
    const { user } = request;
    const todosAdd = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(todosAdd);

    return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const idTodo = user.todos.find((todo) => todo.id === id);

  if(!idTodo) {
    return response.status(404).json({error: 'Mensagem de error'});
  }

  idTodo.title = title;
  idTodo.deadline = deadline;
 
  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;  
  const { user } = request;  

  const idTodo = user.todos.find((todo) => todo.id === id);

  if(!idTodo) {
    return response.status(404).json({error: 'Mensagem de error'});
  }

  idTodo.done = true;
  //sem explica????o de pq deu certo dessa vez. hauhauhau  
 
  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;  
  const { user } = request; 

  const idIncludes = user.todos.find((todo) => todo.id === id);

  if(!idIncludes) {
    return response.status(404).json({error: 'Mensagem de error'});
  }

  const idTodo = user.todos.filter((todo) => todo.id !== id);  

  user.todos = idTodo;
  
  return response.status(204).send();
});

module.exports = app;