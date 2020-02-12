const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocClinicSchema = new Schema({
  ClinicId: {
    type: String,
    default: '',
  },
  doctor_name: {
    type: String,
    default: '',
  },
  Email: {
    type: String,
    default: '',
  },
  mobile_no: {
    type: String,
    default: '',
  },
  ConsultingFees: {
    type: String,
    default: '',
  },
  doctor_id: {
    type: String,
    default: '',
  },
  Speciality: {
    type: Array,
    default: '',
  },
  Address: {
    type: String,
    default: '',
  },
  condition: {
    type: String,
    default: '',
  },
  time_interval: {
    type: String,
    default: '',
  },
  monday_from: {
    type: String,
    default: '',
  },
  monday_to: {
    type: String,
    default: '',
  },
  tue_from: {
    type: String,
    default: '',
  },
  tue_to: {
    type: String,
    default: '',
  },
  wed_to: {
    type: String,
    default: '',
  },
  wed_from: {
    type: String,
    default: '',
  },
  thu_to: {
    type: String,
    default: '',
  },
  thu_from: {
    type: String,
    default: '',
  },
  fri_from: {
    type: String,
    default: '',
  },
  fri_to: {
    type: String,
    default: '',
  },
  sat_from: {
    type: String,
    default: '',
  },
  sat_to: {
    type: String,
    default: '',
  },
  sun_from: {
    type: String,
    default: '',
  },
  sun_to: {
    type: String,
    default: '',
  },
  latitude: {
    type: String,
    default: '',
  },
  longitude: {
    type: String,
    default: '',
  },
  mon: {
    type: String,
    default: '',
  },
  tue: {
    type: String,
    default: '',
  },
  wed: {
    type: String,
    default: '',
  },
  thu: {
    type: String,
    default: '',
  },
  fri: {
    type: String,
    default: '',
  },
  sat: {
    type: String,
    default: '',
  },
  sun: {
    type: String,
    default: '',
  },
  Date: {
    type: Date,
    default: Date.now(),
  },


});

module.exports = mongoose.model('DoctorsClinic', DocClinicSchema);
