
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var SessionSchema = new Schema({
  admin_id: {
    type: String,
  },
 patient_id: {
    type: String,
  },
  token: {
    type: String,
  },
});

module.exports = mongoose.model('sessions', SessionSchema);