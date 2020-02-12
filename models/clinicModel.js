
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clinicSchema = new Schema({
  doctor_id: {
    type: String,
  },
  name: {
    type: String,
  },
  mobile_no: {
    type: String,
  },
  address: {
    type: String,
  },
  monday_from: {
    type: String,
  },
  monday_to: {
    type: String,
  },
  tue_from: {
    type: String,
  },
  tue_to: {
    type: String,
  },
  wed_to: {
    type: String,
  },
  wed_from: {
    type: String,
  },
  thu_to: {
    type: String,
  },
  thu_from: {
    type: String,
  },
  fri_from: {
    type: String,
  },
  fri_to: {
    type: String,
  },
  sat_from: {
    type: String,
  },
  sun_to: {
    type: String,
  },
  sun_from: {
    type: String,
  },
  sat_to: {
    type: String,
  },
  image: {
    type: String,
  },
  image2: {
    type: String,
  },
  image3: {
    type: String,
  },
  description: {
    type: String,
    default: '',
  },
  consultingfees: {
    type: String,
    default: '',
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  time_interval: {
    type: String,

  },
  Created_date: {
    type: Date,
    default: Date.now,
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model('clinics', clinicSchema);
