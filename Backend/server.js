const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Frontend origin
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
  }));
  
app.use(express.json());


mongoose.connect('mongodb://127.0.0.1:27017/friend')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/friends', require('./routes/friends'));
app.use('/recommendations', require('./routes/recommendations'));


app.listen(5000, () => {
    console.log(`Server running on port`);
});
