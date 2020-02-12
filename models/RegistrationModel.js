const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registrationSchema = new Schema({
  ClinicName: {
    type: String,
    default: '',
  },
  Address: {
    type: String,
    default: '',
  },
  Email: {
    type: String,
    default: '',
  },
  ContactNumber: {
    type: Number,
    default: '',
  },
  Password: {
    type: String,
    default: '',
  },
  LicenseUpload: {
    type: String,
    default: '',
  },
  ResetToken: {
    type: String,
    default: '',
  },
  TokenExpiry: {
    type: Date,
    default: Date.now(),
  },
  latitude: {
    type: String,
    default: '',
  },
  longitude: {
    type: String,
    default: '',
  },
  DeviceId: {
    type: String,
    default: '',
  },
  Image: {
    type: String,
    default: '',
  },
  Image2: {
    type: String,
    default: '',
  },
  Image3: {
    type: String,
    default: '',
  },
  RegistrationNo: {
    type: String,
    default: '',
  },
  ClinicRegistrationNo: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('ClinicRegistration', registrationSchema);
