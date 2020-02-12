const {body} = require('express-validator');
const {validationResult} = require('express-validator');

exports.validation = [
  body('Email').isEmail().withMessage('Enter the valid email address'),
  body('Real_Password').isLength({min: 5}).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,12}$/)
      .withMessage('7 to 12 characters which contain at least one numeric digit, one uppercase and one lowercase letter'),
  body('Firstname').isLength({min: 1}).withMessage('Firstname field should not be empty'),
  body('Lastname').isLength({min: 1}).withMessage('Lastname field should not be empty'),
  body('Age').isNumeric().withMessage('Inavalid age'),
  body('Address').isLength({min: 1}).withMessage('Address field should not be empty'),
  body('MobileNumber').isLength({min: 10, max: 12}).withMessage('Invalid contact number'),

  (req, res, next)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array()});
      return;
    }
    next();
  },
];

exports.offervalidation = [
  body('code').isLength({min: 1}).withMessage('Please enter the code'),
  body('isPercent').isLength({min: 1}).withMessage('Enter the numaric values'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array()});
      return;
    }
    next();
  },
];

exports.addressvalidation = [
  body('address').isLength({min: 1}).withMessage('Flat/Building/Street is empty'),
  body('save_as').isLength({min: 1}).withMessage('save as field is empty'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array(),
        oldinput: {address: `${req.body.address}`, save_as: `${req.body.save_as}`}});
      return;
    }
    next();
  },
];

exports.bookingvalidation = [
  body('firstname', 'Please Enter the valid name').isLength({min: 1}).trim(),
  body('lastname', 'Please Enter the valid lastname').trim(),
  body('age', 'Please Enter the valid age').isLength({min: 1}).isNumeric().trim(),
  body('bloodgroup', 'Please Enter the valid Blood Group').matches( /^[a-zA-Z +-]*$/),
  body('email', 'Please Enter the valid Email address').isEmail().normalizeEmail().isLength({min: 1}).trim(),
  body('mobilenumber', 'Please Enter the valid Mobile number').isMobilePhone().isLength({min: 1, max: 10}).trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array()});
      return;
    }
    next();
  },
];

exports.ClinicValidation = [
  body('ClinicName', 'Please Enter the vaild name').isLength({min: 1}).trim(),
  body('Address', 'Please Enter the valid address').isLength({min: 1}).trim(),
  body('Email', 'Please Enter the valid Email address')
      .isEmail()
      .normalizeEmail()
      .isLength({min: 1}).trim(),
  body('ContactNumber', 'Please Enter the valid Contact number ')
      .isMobilePhone()
      .isLength({min: 10}).trim(),
  body('Password', '7 to 12 characters which contain at least one numeric digit,one uppercase and one lowercase letter')
      .isLength({min: 7, max: 12}).trim(),
  body('ConfirmPassword').custom((value, {req}) => {
    if (value !== req.body.Password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  (req, res, next)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array()});
      return;
    }
    next();
  },

];

exports.resetpwd = [
  body('Password', `7 to 12 characters which contain at least one numeric 
    digit,one uppercase and one lowercase letter`)
      .isLength({min: 7, max: 12}).trim(),
  body('ConfirmPassword').custom((value, {req}) => {
    if (value !== req.body.Password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  (req, res, next)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array()});
      return;
    }
    next();
  },
];

exports.DocCli = [
  body('ConsultingFees', `consultation fees shoudln't be empty`)
      .isNumeric().trim(),
  body('Speciality', `Speciality field shouldn't be empty`)
      .trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array()});
      return;
    }
    next();
  },
];

exports.sendmail = [
  body('Email', 'Please enter the valid email')
      .isEmail().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array()});
      return;
    }
    next();
  },
];

exports.Receipt = [
  body('PatientName', 'Please enter the patient name')
      .isLength({min: 1}),
  body('Email', 'Please enter the valid email')
      .isEmail().trim(),
  body('Age', 'Please fill age field')
      .isLength({min: 1, max: 2}).trim(),
  body('Sex', 'Please enter the gender')
      .isLength({min: 1}).trim(),
  body('_id', 'Please enter the test id')
      .isLength({min: 1}).trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array()});
      return;
    }
    next();
  },
];

exports.ClinicLoginValidation = [
  body('Email', 'Please Enter the valid Email address')
      .isEmail().trim(),
  body('Password', 'Please Enter the correct Password')
      .isLength({min: 1}).trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({errors: errors.array()});
      return;
    }
    next();
  },
];
