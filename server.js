const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({useNewUrlParser: true}));
app.use(bodyparser.json());

const receptionRoutes = require('./routes/receptionRoutes');
app.use(receptionRoutes);

mongoose.connect('mongodb://localhost:27017/plexi')
    .then(() => {
      app.listen(3001);
      console.log('App is running on port number 3001');
    })
    .catch((err) => {
      console.log(err);
    });
