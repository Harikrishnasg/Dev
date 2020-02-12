
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const DoctorSchema = new Schema({
  doctor_id: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  capitol_name: {
    type: String,
    default: '',
  },
  other_degree: {
    type: String,
    default: '',
  },
  fav_list: {
    type: Array,
    default: [],
  },
  doctor_name: {
    type: String,
    default: '',
  },
  award: {
    type: Array,
    default: [],
  },
  medical_register_number: {
    type: String,
    default: '',
  },
  weblink: {
    type: String,
    default: '',
  },
  consultation_fee: {
    type: String,
    default: '',
  },
  specialist_id: {
    type: Array,
    default: [],
  },
  password: {
    type: String,
    default: '',
  },
  real_password: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },
  general_edu: {
    type: String,
    default: '',
  },
  experience: {
    type: String,
    default: '',
  },
  ratings: {
    type: String,
    default: '',
  },
  favourities: {
    type: Array,
    default: [],
  },
  addtional_edu: {
    type: String,
    default: '',
  },
  treatment_id: {
    type: Array,
    default: [],
  },
  language: {
    type: Array,
    default: [],
  },
  mobile_no: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  membership: {
    type: String,
    default: '',
  },
  Created_date: {
    type: Date,
    default: Date.now,
  },
  profile_image: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  secure_token: {
    type: String,
    default: '',

  },
  status: {
    type: String,
    default: '0',
  },
  expertStatus: {
    type: String,
    default: '0',
  },
  interestExpert: {
    type: String,
    default: '0',
  },
  device_type: {
    type: String,
    default: '',
  },
  device_id: {
    type: String,
    default: '',
  },
  device_id_web: {
    type: String,
    default: '',
  },
  device_type_web: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('doctors', DoctorSchema);
