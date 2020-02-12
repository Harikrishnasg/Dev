const express = require('express');
const route = express.Router();


const reception = require('../Controllers/receptionController');
const validation = require('../Middleware/validation');
const auth = require('../Middleware/isAuth');
const multer = require('multer');

const upload = multer({dest: '/usr/share/nginx/html/plexihealth.com/plexi_admin/images/Reception/'}, (err) => {
  if (err) {
    console.log(err);
  }
});

route.post('/ClinicReg', upload.fields([{name: 'file', maxCount: 1},
  {name: 'Image', maxCount: 1}, {name: 'Image2', maxCount: 1},
  {name: 'Image3', maxCount: 1}]), validation.ClinicValidation,
reception.Registration);
route.post('/login', reception.login);
route.post('/forgetpwd', reception.ForgetPassword);
route.get('/resetpwd/:token', validation.resetpwd, reception.ResetPass);
route.get('/SearchDoc', auth.clinic, reception.SearchDoc);
route.post('/DocCli', auth.clinic, validation.DocCli,
    reception.DocClinic);
route.post('/sendmail', auth.clinic, validation.sendmail,
    reception.SendMail);
route.post('/editCprofile', upload.fields([{name: 'Image', maxCount: 1}]),
    auth.clinic, reception.EditProfile);
route.get('/viewprofile', auth.clinic, reception.ViewClinicProfile);
route.get('/docdate', auth.clinic, reception.docsdatewise);
route.get('/ListDocs', auth.clinic, reception.listdocs);
route.get('/getemail/:token', reception.GetEmail);


module.exports = route;
