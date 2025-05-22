// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const todosCollection = db.collection('todos');

// Get all todos
app.get('/todos', async (req, res) => {
  try {
    const snapshot = await todosCollection.get();
    const todos = [];
    snapshot.forEach(doc => {
      todos.push({ id: doc.id, ...doc.data() });
    });
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add a new todo
app.post('/todos', async (req, res) => {
  try {
    const { text } = req.body;
    const docRef = await todosCollection.add({ text });
    const newTodo = { id: docRef.id, text };
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await todosCollection.doc(id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Summarize todos and send to Slack
app.post('/summarize', async (req, res) => {
  try {
    const snapshot = await todosCollection.get();
    const todos = [];
    snapshot.forEach(doc => {
      todos.push(doc.data().text);
    });

    if (todos.length === 0) {
      return res.json({ message: 'No todos to summarize.' });
    }

    const summary = await summarizeTodos(todos);
    await sendToSlack(summary);

    res.json({ message: 'Summary successfully sent to Slack!' });
  } catch (error) { 
    if (error.response && error.response.status === 429) {
      return res.status(429).json({ error: 'OpenAI API rate limit exceeded. Please try again later.' });
    }
    console.error('Error summarizing or sending to Slack:', error);
    res.status(500).json({ error: 'Failed to summarize or send to Slack' });
  }
});

// Helper function to call LLM (OpenAI)
const summarizeTodos = async (todos) => {
  const prompt = `Please provide a concise summary of the following to-do items:\n\n${todos.map((todo, i) => `${i + 1}. ${todo}`).join('\n')}\n\nSummary:`;

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
    temperature: 0.7,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content.trim();
};

// Helper function to send summary to Slack
const sendToSlack = async (summary) => {
  await axios.post(process.env.SLACK_WEBHOOK_URL, { text: summary });
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
