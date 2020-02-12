const mongoose = require('mongoose');
const Schema = mongoose.Schema;

bookingidSchema = new Schema({
  bookings: {
    type: Number,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  Clinic: {
    type: String,
    default: '',
  },
  RegistrationNo: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('BookingId', bookingidSchema);