const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClinicSchema = new Schema({
  ClinicId: {
    type: String,
    default: '',
  },
  Token: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('ClinicSessions', ClinicSchema);
