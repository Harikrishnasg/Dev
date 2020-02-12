const sessions = require('../models/sessionModel');
const sess = require('../models/CliSessionModel');

exports.auth = async (req, res, next) => {
  const sess = await sessions.find({token: req.query.token, patient_id: req.query.patient_id}, () => {});
  if (sess.length === 0) {
    return res.status(401).json({status: 'You are not autherized', result: ''});
  }
  next();
};

exports.admin = async (req, res, next) => {
  const sess = await sessions.find({token: req.query.token, admin_id: req.query.admin_id});
  if (sess.length === 0) {
    return res.status(401).json({status: 'You are not autherized', result: ''});
  }
  next();
};

exports.clinic = async (req, res, next) => {
  const sess1 = await sess.find({Token: req.query.Token,
    ClinicId: req.query.ClinicId});
    console.log(sess1);
  if (sess1.length === 0) {
    return res.status(401).json({status: 'You are not autherized'});
  }
  next();
};
