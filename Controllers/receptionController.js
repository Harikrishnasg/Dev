
const ClinicReg = require('../models/RegistrationModel');
const Sessions = require('../models/CliSessionModel');
const doctors = require('../models/doctorModel');
const DocCli = require('../models/DocClinicModel');
const Clinic = require('../models/clinicModel');
const NoOfReg = require('../models/bookingid_model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const moment = require('moment');
const RegexEscape = require('regex-escape');


const Transporter = nodemailer.createTransport({
  host: 'mail14.yuvanetworks.net',
  service: 'mail14.yuvanetworks',
  port: 465,
  auth: {
    user: 'info@plexihealth.com',
    pass: 'Info@!123',
  },
});


exports.Registration = async (req, res, next) => {
  try {
    bcrypt.hash(req.body.Password, 12, async (err, hash) => {
      const istrue = await ClinicReg.find({Email: req.body.Email});
      let image;
      let Image2;
      let Image3;
      let filename1; // clinic profile Image
      let filename2; // license to upload
      let filename3; // clinic profile Image2
      let filename4; // clinic profile Image3


      if (!req.files['Image']) {
        filename1 = '';
      } else {
        image = req.files['Image'];
        filename1 = 'https://www.plexihealth.com/plexi_admin/images/Reception/'+
        Math.floor(1000+Math.random()*9000)+
         '_'+image[0].originalname;
      }

      if (!req.files['Image2']) {
        filename3 = '';
      } else {
        Image2 = req.files['Image2'];
        filename3 = 'https://www.plexihealth.com/plexi_admin/images/Reception/'+
        Math.floor(1000+Math.random()*9000)+
         '_'+Image2[0].originalname;
      }

      if (!req.files['Image3']) {
        filename4 = '';
      } else {
        Image3 = req.files['Image3'];
        filename4 = 'https://www.plexihealth.com/plexi_admin/images/Reception/'+
        Math.floor(1000+Math.random()*9000)+
         '_'+Image3[0].originalname;
      }

      if (!req.files['file']) {
        filename2 = '';
      } else {
        filename2 = 'https://www.plexihealth.com/plexi_admin/images/Reception/'+
        Math.floor(1000+Math.random()*9000)+
        '_'+image[0].originalname;
      }

      if (istrue.length === 0) {
        const regst = await NoOfReg.find({Clinic: 'Yes'});

        await new ClinicReg({
          ClinicName: req.body.ClinicName,
          Address: req.body.Address,
          Email: req.body.Email,
          ContactNumber: req.body.ContactNumber,
          PhoneNo: req.body.PhoneNo,
          Password: hash,
          Image: filename1,
          LicenseUpload: filename2,
          Image2: filename3,
          Image3: filename4,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          RegistrationNo: +1 + +regst[0].RegistrationNo,
          ClinicRegistrationNo: req.body.ClinicRegistrationNo,
        }).save();

        const cli = await ClinicReg.find({Email: req.body.Email});
        // console.log(cli, '#3');
        const upregst = await NoOfReg.updateOne({
          Clinic: 'Yes'}, {$set: {RegistrationNo: cli[0].RegistrationNo},
        }, {new: true});
        console.log(upregst);
        res.status(200).json({status: 'Success', result: ''});
      } else {
        res.status(200).json({status: 'Clinic Already Registered', data: ''});
      };
    });
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const istrue = await ClinicReg.find({Email: req.body.Email});
    if (istrue.length === 0) {
      res.status(401).json({status: 'Invalid usename or password'});
    } else {
      const pass = req.body.Password;
      if (!pass) {
        return res.status(401).json({status: 'Invalid Credentials'});
      }
      bcrypt.compare(req.body.Password, istrue[0].Password, (err, sess) => {
        if (sess) {
          crypto.randomBytes(28, (err, buffer) => {
            if (err) {
              console.log(err);
            }
            const token = buffer.toString('hex');
            clisess = new Sessions({
              ClinicId: istrue[0]._id,
              Token: token,
            });
            clisess.save();
            clinic = Array({ClinicId: istrue[0]._id, Token: token,
              ClinicName: istrue[0].ClinicName, Image: istrue[0].Image});
            return res.status(200)
                .json({status: 'success', data: clinic});
          });
        } else {
          res.status(401).json({status: 'Invalid Credentials'});
        }

        // console.log(err);
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.ForgetPassword = async (req, res, next) => {
  try {
    const istrue = await ClinicReg.find({Email: req.body.Email});
    if (istrue.length === 0) {
      res.status(401).json({status: 'Invalid Email address'});
    } else {
      crypto.randomBytes(25, async (err, buffer) => {
        if (err) {
          console.log(err);
        }
        const ResetToken = buffer.toString('hex');
        const TokenExpiry = Date.now()+900000;

        ClinicReg.updateMany({Email: req.body.Email},
            {$set: {ResetToken: ResetToken, TokenExpiry: TokenExpiry}},
            async (err, data) => {
              const token = await ClinicReg.find({Email: req.body.Email});
              Transporter.sendMail({
                from: 'info@plexihealth.com',
                to: istrue[0].Email,
                subject: 'Reset password',
                html: `<p>Please click the below url for reset your password.
                      This url will be valid for 15 mins,
                    </p><p>https://www.plexihealth.com:3001/resetpwd/${token[0].ResetToken}
                    '</p><p>For any queries, please contact <a href="mailto
                    :info@plexihealth.com;">
                    info@plexihealth.com</a>.</p><p>Thanks & Welcome Again,
                    <br/>Have a Nice Day.
                    </p><p>Regards,<br/>PlexiHealth Team</p>`,
              });
            });

        res.status(200).json({status: 'Success'});
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.ResetPass = async (req, res, next) => {
  try {
    const istrue = await ClinicReg.find({
      ResetToken: req.params.token,
      TokenExpiry: {$gt: Date.now()},
    });
    if (istrue.length === 0) {
      res.status(401).json({status: 'Token is expired'});
    } else {
      bcrypt.hash(req.body.Password, 12,
          async (err, hash) => {
            updatePass = await ClinicReg.updateOne({Email: req.body.Email},
                {$set: {Password: hash, ResetToken: ''}});
          });
      res.status(200).json({status: 'Password Changed Successfully'});
    }
  } catch (err) {
    console.log(err);
  }
};

exports.SearchDoc = async (req, res, next) => {
  try {
    const details = [];
    if (req.query.email) {
      email = RegexEscape(req.query.email);

      const doc = await doctors.find({
        doctor_name: {$regex: email,
          $options: 'i'},
      });
      if (doc.length === 0) {
        return res.status(500).json({status: 'doctor not found'});
      }
      for (let i=0; i<doc.length; i++) {
        details.push({'DoctorName': doc[i].doctor_name,
          'Email': doc[i].email, 'MobileNo': doc[i].mobile_no,
          '_id': doc[i]._id});
      }
      return res.status(200).json({data: details});
    }
    if (req.query.mobile_no) {
      const mobile_no = req.query.mobile_no.split('@')[0];
      const doc = await doctors.find({
        mobile_no: {$regex: mobile_no, $options: 'i'},
      });
      if (doc.length === 0) {
        res.status(500).json({status: 'doctor not found'});
      }
      for (let i=0; i<doc.length; i++) {
        details.push({'DoctorName': doc[i].doctor_name,
          'Email': doc[i].email, 'MobileNo': doc[i].mobile_no,
          '_id': doc[i]._id});
      }
      return res.status(200).json({data: details});
    }
  } catch (err) {
    console.log(err);
  }
};

exports.DocClinic = async (req, res, next) => {
  try {
    let ToTime = '';
    let FromTime = '';
    let ToMinutes = '';
    let FromMinutes = '';
    if (!req.body.ToMinutes) {
      ToMinutes = '00';
    } else {
      ToMinutes = req.body.ToMinutes;
    }
    if (!req.body.FromMinutes) {
      FromMinutes = '00';
    } else {
      FromMinutes = req.body.FromMinutes;
    }
    const cliadds = await ClinicReg.find({_id: req.query.ClinicId});
    const istrue =await DocCli.find({doctor_id: req.query.DoctorId,
      ClinicId: req.query.ClinicId});
    if (istrue.length === 0) {
      const mail = await DocCli.find({Email: req.body.Email});
      if (mail.length === 0 ) {
        if (req.body.condition === 'all') {
          const P = 12;
          const PT = +P + +req.body.ToTimeHrs;
          const PF = +P + +req.body.FromTimeHrs;
          if (req.body.ToTimeAm === 'PM') {
            const ToHours = PT;
            ToTime = ToHours + ':' + ToMinutes;
          } else {
            if (req.body.ToTimeHrs) {
              const ToHours = req.body.ToTimeHrs;
              ToTime = ToHours + ':' + ToMinutes;
            } else {
              ToTime = '';
            }
          }

          if (req.body.FromTimeAm === 'PM') {
            const FromHours = PF;
            FromTime = FromHours + ':' + FromMinutes;
          } else {
            if (req.body.FromTimeHrs) {
              const FromHours = req.body.FromTimeHrs;
              FromTime = FromHours + ':' + FromMinutes;
            } else {
              FromTime = '';
            }
          }
          const data = await doctors.findById({_id: req.query.DoctorId});

          const addDoc = new DocCli({
            ClinicId: req.query.ClinicId,
            doctor_name: data.doctor_name,
            Email: data.email,
            mobile_no: data.mobile_no,
            ConsultingFees: req.body.ConsultingFees,
            doctor_id: req.query.DoctorId,
            Address: cliadds[0].Address,
            condition: req.body.condition,
            monday_to: ToTime,
            monday_from: FromTime,
            tue_to: ToTime,
            tue_from: FromTime,
            wed_to: ToTime,
            wed_from: FromTime,
            thu_to: ToTime,
            thu_from: FromTime,
            fri_to: ToTime,
            fri_from: FromTime,
            sat_to: ToTime,
            sat_from: FromTime,
            sun_to: ToTime,
            sun_from: FromTime,
            mon: '1',
            tue: '1',
            wed: '1',
            thu: '1',
            fri: '1',
            sat: '1',
            sun: '1',
            time_interval: req.body.time_interval,
          });
          addDoc.save();
          // saving data in clinic
          const cli = new Clinic({
            doctor_id: req.query.DoctorId,
            name: cliadds[0].ClinicName,
            address: cliadds[0].Address,
            image: cliadds[0].Image,
            longitude: cliadds[0].longitude,
            latitude: cliadds[0].latitude,
            monday_to: ToTime,
            monday_from: FromTime,
            tue_to: ToTime,
            tue_from: FromTime,
            wed_to: ToTime,
            wed_from: FromTime,
            thu_to: ToTime,
            thu_from: FromTime,
            fri_to: ToTime,
            fri_from: FromTime,
            sat_to: ToTime,
            sat_from: FromTime,
            sun_to: ToTime,
            sun_from: FromTime,
            mobile_no: req.body.mobile_no,
            condition: req.body.condition,
            consultingfees: req.body.consultingfees,
            time_interval: req.body.time_interval,
          });
          cli.save();

          res.status(200).json({status: 'success', data: ''});
        } else {
          // Monday
          const P = 12;
          let PT = +P + +req.body.MonToTimeHrs;
          let PF = +P + +req.body.MonFromTimeHrs;
          let MonToTime = '';
          let MonFromTime = '';
          let mon;
          let MonToMinutes;
          if (!req.body.MonToMinutes) {
            MonToMinutes = '00';
          } else {
            MonToMinutes = req.body.MonToMinutes;
          }
          if (req.body.MonToTimeAm === 'PM') {
            MonToTime = PT + ':' + MonToMinutes;
            mon = '1';
          } else {
            if (req.body.MonToTimeHrs && MonToMinutes) {
              MonToTime = req.body.MonToTimeHrs+':'+MonToMinutes;
            } else {
              MonToTime = '';
              mon = '0';
            }
          }
          if (!req.body.MonFromMinutes) {
            MonFromMinutes = '00';
          } else {
            MonFromMinutes = req.body.MonFromMinutes;
          }
          if (req.body.MonFromTimeAm === 'PM') {
            MonFromTime = PF + ':' + MonFromMinutes;
          } else {
            if (req.body.MonFromTimeHrs && MonFromMinutes) {
              MonFromTime = req.body.MonFromTimeHrs+':'+ MonFromMinutes;
            } else {
              MonFromTime = '';
            }
          }
          // Tuesday

          PT = +P + +req.body.TueToTimeHrs;
          PF = +P + +req.body.TueFromTimeHrs;
          let TueToTime = '';
          let TueFromTime = '';
          let tue;
          let TueToMinutes;
          if (!req.body.TueToMinutes) {
            TueToMinutes = '00';
          } else {
            TueToMinutes = req.body.TueToMinutes;
          }


          if (req.body.TueToTimeAm === 'PM') {
            TueToTime = PT + ':' + TueToMinutes;
            tue = '1';
          } else {
            if (req.body.TueToTimeHrs && TueToMinutes) {
              TueToTime = req.body.TueToTimeHrs + ':' + TueToMinutes;
            } else {
              TueToTime = '';
              tue = '0';
            }
          }
          let TueFromMinutes;
          if (!req.body.TueFromMinutes) {
            TueFromMinutes = '00';
          } else {
            TueFromMinutes = req.body.TueFromMinutes;
          }
          if (req.body.TueFromTimeAm === 'PM') {
            TueFromTime = PF + ':' + TueFromMinutes;
          } else {
            if (req.body.TueFromTimeHrs && TueFromMinutes) {
              TueFromTime = req.body.TueFromTimeHrs+':'+TueFromMinutes;
            } else {
              TueFromTime = '';
            }
          }
          // Wednesday

          PT = +P + +req.body.WedToTimeHrs;
          PF = +P + +req.body.WedFromTimeHrs;
          let WedToTime = '';
          let WedFromTime = '';
          let wed;
          let WedToMinutes;
          if (!req.body.WedToMinutes) {
            WedToMinutes = '00';
          } else {
            WedToMinutes = req.body.WedToMinutes;
          }


          if (req.body.WedToTimeAm === 'PM') {
            WedToTime = PT + ':' + WedToMinutes;
            wed = '1';
          } else {
            if (req.body.WedToTimeHrs && WedToMinutes) {
              WedToTime = req.body.WedToTimeHrs + ':' + WedToMinutes;
            } else {
              WedToTime = '';
              wed = '0';
            }
          }
          let WedFromMinutes;
          if (!req.body.WedFromMinutes) {
            WedFromMinutes = '00';
          } else {
            WedFromMinutes = req.body.WedFromMinutes;
          }
          if (req.body.WedFromTimeAm === 'PM') {
            WedFromTime = PF + ':' + WedFromMinutes;
          } else {
            if (req.body.WedFromTimeHrs && WedFromMinutes) {
              WedFromTime = req.body.WedFromTimeHrs+':'+WedFromMinutes;
            } else {
              WedFromTime = '';
            }
          }
          // Thursday

          PT = +P + +req.body.ThuToTimeHrs;
          PF = +P + +req.body.ThuFromTimeHrs;
          let ThuToTime = '';
          let ThuFromTime = '';
          let thu;
          let ThuToMinutes;
          if (!req.body.ThuToMinutes) {
            ThuToMinutes = '00';
          } else {
            ThuToMinutes = req.body.ThuToMinutes;
          }

          if (req.body.ThuToTimeAm === 'PM') {
            ThuToTime = PT + ':' + ThuToMinutes;
            thu = '1';
          } else {
            if (req.body.ThuToTimeHrs && ThuToMinutes) {
              ThuToTime = req.body.ThuToTimeHrs + ':' + ThuToMinutes;
            } else {
              ThuToTime = '';
              thu = '0';
            }
          }
          let ThuFromMinutes;
          if (!req.body.ThuFromMinutes) {
            ThuFromMinutes = '00';
          } else {
            ThuFromMinutes = req.body.ThuFromMinutes;
          }
          if (req.body.ThuFromTimeAm === 'PM') {
            ThuFromTime = PF + ':' + ThuFromMinutes;
          } else {
            if (req.body.ThuFromTimeHrs && ThuFromMinutes) {
              ThuFromTime = req.body.ThuFromTimeHrs+':'+ThuFromMinutes;
            } else {
              ThuFromTime = '';
            }
          }
          // Friday

          PT = +P + +req.body.FriToTimeHrs;
          PF = +P + +req.body.FriFromTimeHrs;
          let FriToTime = '';
          let FriFromTime = '';
          let fri;
          let FriToMinutes;
          if (!req.body.FriToMinutes) {
            FriToMinutes = '00';
          } else {
            FriToMinutes = req.body.FriFromMinutes;
          }

          if (req.body.FriToTimeAm === 'PM') {
            FriToTime = PT + ':' + FriToMinutes;
            fri = '1';
          } else {
            if (req.body.FriFromTimeHrs && req.body.FriFromTime) {
              FriToTime = req.body.FriToTimeHrs + ':' + FriToMinutes;
            } else {
              FriToTime = '';
              fri = '0';
            }
          }
          let FriFromMinutes;
          if (!req.body.FriFromMinutes) {
            FriFromMinutes = '00';
          } else {
            FriFromMinutes = req.body.FriFromMinutes;
          }
          if (req.body.FriFromTimeAm === 'PM') {
            FriFromTime = PF + ':' + FriFromMinutes;
          } else {
            if (req.body.FriFromTimeHrs && FriFromMinutes) {
              FriFromTime = req.body.FriFromTimeHrs+':'+FriFromMinutes;
            } else {
              FriFromTime = '';
            }
          }
          // Saturday

          PT = +P + +req.body.SatToTimeHrs;
          PF = +P + +req.body.SatFromTimeHrs;
          let SatToTime = '';
          let SatFromTime = '';
          let sat;
          let SatToMinutes;
          if (!req.body.SatToMinutes) {
            SatToMinutes = '00';
          } else {
            SatToMinutes = req.body.SatToMinutes;
          }

          if (req.body.SatToTimeAm === 'PM') {
            SatToTime = PT + ':' + SatToMinutes;
            sat = '1';
          } else {
            if (req.body.SatToTimeHrs && SatToMinutes) {
              SatToTime = req.body.SatToTimeHrs + ':' + SatToMinutes;
            } else {
              SatToTime = '';
              sat = '0';
            }
          }
          let SatFromMinutes;
          if (!req.body.SatFromMinutes) {
            SatFromMinutes = '00';
          } else {
            SatFromMinutes = req.body.SatFromMinutes;
          }
          if (req.body.SatFromTimeAm === 'PM') {
            SatFromTime = PF + ':' + SatFromMinutes;
          } else {
            if (req.body.SatFromTimeHrs && SatFromMinutes) {
              SatFromTime = req.body.SatFromTimeHrs+':'+SatFromMinutes;
            } else {
              SatFromTime = '';
            }
          }
          // Sunday

          PT = +P + +req.body.SunToTimeHrs;
          PF = +P + +req.body.SunFromTimeHrs;
          let SunToTime = '';
          let SunFromTime = '';
          let sun;
          let SunToMinutes;
          if (!req.body.SunToMinutes) {
            SunToMinutes = '00';
          } else {
            SunToMinutes = req.body.SunToMinutes;
          }

          if (req.body.SunToTimeAm === 'PM') {
            SunToTime = PT + ':' + SunToMinutes;
            sun = '1';
          } else {
            if (req.body.SunToTimeHrs && SunToMinutes) {
              SunToTime = req.body.SunToTimeHrs + ':' + SunToMinutes;
            } else {
              SunToTime = '';
              sun = '0';
            }
          }
          let SunFromMinutes;
          if (!req.body.SunFromMinutes) {
            SunFromMinutes = '00';
          } else {
            SunFromMinutes = req.body.SunFromMinutes;
          }
          if (req.body.SunFromTimeAm === 'PM') {
            SunFromTime = PF + ':' + SunFromMinutes;
          } else {
            if (req.body.SunFromTimeHrs && SunFromMinutes) {
              SunFromTime = req.body.SunFromTimeHrs+':'+SunFromMinutes;
            } else {
              SunFromTime = '';
            }
          }


          const addDoc = new DocCli({
            ClinicId: req.query.ClinicId,
            doctor_name: data.doctor_name,
            Email: data.email,
            mobile_no: data.mobile_no,
            ConsultingFees: req.body.ConsultingFees,
            doctor_id: req.query.DoctorId,
            Address: cliadds[0].Address,
            condition: req.body.condition,
            monday_to: MonToTime,
            monday_from: MonFromTime,
            tue_to: TueToTime,
            tue_from: TueFromTime,
            wed_to: WedToTime,
            wed_from: WedFromTime,
            thu_to: ThuToTime,
            thu_from: ThuFromTime,
            fri_to: FriToTime,
            fri_from: FriFromTime,
            sat_to: SatToTime,
            sat_from: SatFromTime,
            sun_to: SunToTime,
            sun_from: SunFromTime,
            time_interval: req.body.time_interval,
            mon: mon,
            tue: tue,
            wed: wed,
            thu: thu,
            fri: fri,
            sat: sat,
            sun: sun,
          });
          addDoc.save();
          // saving in clinic
          const cli = new Clinic({
            doctor_id: req.query.DoctorId,
            name: cliadds[0].ClinicName,
            address: cliadds[0].Address,
            image: cliadds[0].Image,
            longitude: cliadds[0].longitude,
            latitude: cliadds[0].latitude,
            monday_to: MonToTime,
            monday_from: MonFromTime,
            tue_to: TueToTime,
            tue_from: TueFromTime,
            wed_to: WedToTime,
            wed_from: WedFromTime,
            thu_to: ThuToTime,
            thu_from: ThuFromTime,
            fri_to: FriToTime,
            fri_from: FriFromTime,
            sat_to: SatToTime,
            sat_from: SatFromTime,
            sun_to: SunToTime,
            sun_from: SunFromTime,
            mobile_no: req.body.mobile_no,
            condition: req.body.condition,
            consultingfees: req.body.consultingfees,
            time_interval: req.body.time_interval,
          });
          cli.save();

          res.status(200).json({status: 'success', data: ''});
        }
      } else {
        res.status(422).json({status: 'This Email already exist'});
      }
    } else {
      res.status(401).json({status: 'Doctor Already registered',
        data: ''});
    }
  } catch (err) {
    console.log(err);
  }
};

exports.SendMail = async (req, res, next) => {
  try {
    if (!req.body.Email) {
      return res.status(422).json({status: 'Please enter the email address'});
    }
    const cli = await ClinicReg.find({_id: req.query.ClinicId});
    Transporter.sendMail({
      from: 'info@plexihealth.com',
      to: req.body.Email,
      subject: 'Sign Up for Plexihealth',
      bcc: 'info@plexihealth.com',
      html: `<div> Hello doctor, ${cli[0].ClinicName} wants to add you to their profile.
      kindly sign up to PlexiHealth account using below link.
      https://doctor.plexihealth.com/#/signup
      </b></br></div>`,
    });
    res.status(200).json({'status': 'Mail sent successfully.'});
  } catch (err) {
    console.log(err);
  }
};

exports.EditProfile = async (req, res, next) => {
  try {
    let filename1;
    if (!req.files['Image']) {
      filename1 = '';
    } else {
      image = req.files['Image'];
      filename1 = '/home/yash/Desktop/images/'+
      Math.floor(1000+Math.random()*9000)+
       '_'+image[0].originalname;
      await ClinicReg.updateOne({_id: req.query.ClinicId}, {
        Image: filename1}, {new: true})
          .then((err, data) => {
            if (err) {
              console.log(err);
            }
          });
    }


    await ClinicReg.updateOne({
      _id: req.query.ClinicId}, {
      ContactNumber: req.body.ContactNumber, PhoneNo: req.body.ContactNumber,
      Email: req.body.Email}, {new: true})
        .then((data) => {
          res.status(200).json({
            status: 'Profile edited successfully', data: '',
          });
        });
  } catch (err) {
    console.log(err);
  }
};

exports.ViewClinicProfile = async (req, res, next) => {
  try {
    const details = [];
    const istrue = await ClinicReg.find({
      _id: req.query.ClinicId,
    });
    if (istrue.length === 0) {
      return res.status(401).json({status: 'Not Found', data: ''});
    }
    details.push({
      'ClinicName': istrue[0].ClinicName, 'Address': istrue[0].Address,
      'Email': istrue[0].Email, 'ContactNumber': istrue[0].ContactNumber,
      'LicenseUpload': istrue[0].LicenseUpload, 'Image': istrue[0].Image,
      'lattitude': istrue[0].latitude, 'longitude': istrue[0].longitude});

    res.status(200).json({status: 'success', data: details});

    console.log(istrue);
  } catch (err) {
    console.log(err);
  }
};

exports.docsdatewise = async (req, res, next) => {
  try {
    const active = [];

    // Monday
    if ('Monday'=== moment().format('dddd')) {
      const istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, mon: '1',
      });
      for (let i=0; i<istrue.length; i++) {
        active.push({
          'doctor_name': istrue[i].doctor_name, 'Email': istrue[i].Email,
          'mobile_no': istrue[i].mobile_no,
          'ConsultingFees': istrue[i].ConsultingFees,
          'Address': istrue[i].Address,
          'time_interval': istrue[i].time_interval,
          'monday_from': istrue[i].monday_from,
          'monday_to': istrue[i].monday_to, 'tue_from': istrue[i].tue_from,
          'tue_to': istrue[i].tue_to, 'wed_from': istrue[i].wed_from,
          'wed_to': istrue[i].wed_to, 'thu_from': istrue[i].thu_from,
          'thu_to': istrue[i].to, 'fri_from': istrue[i].fri_from,
          'fri_to': istrue[i].fri_to, 'sat_from': istrue[i].sat_from,
          'sat_to': istrue[i].sat_to, 'sun_from': istrue[i].sun_from,
          'sun_to': istrue[i].sun_to, 'latitude': istrue[i].latitude,
          'longitude': istrue[i].longitude, 'available': '1'});
      }
    }

    if ('Monday'=== moment().format('dddd')) {
      const Istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, mon: '0',
      });
      for (let i=0; i<Istrue.length; i++) {
        active.push({
          'doctor_name': Istrue[i].doctor_name, 'Email': Istrue[i].Email,
          'mobile_no': Istrue[i].mobile_no,
          'ConsultingFees': Istrue[i].ConsultingFees,
          'Address': Istrue[i].Address,
          'time_interval': Istrue[i].time_interval,
          'monday_from': Istrue[i].monday_from,
          'monday_to': Istrue[i].monday_to, 'tue_from': Istrue[i].tue_from,
          'tue_to': Istrue[i].tue_to, 'wed_from': Istrue[i].wed_from,
          'wed_to': Istrue[i].wed_to, 'thu_from': Istrue[i].thu_from,
          'thu_to': Istrue[i].to, 'fri_from': Istrue[i].fri_from,
          'fri_to': Istrue[i].fri_to, 'sat_from': Istrue[i].sat_from,
          'sat_to': Istrue[i].sat_to, 'sun_from': Istrue[i].sun_from,
          'sun_to': Istrue[i].sun_to, 'latitude': Istrue[i].latitude,
          'longitude': Istrue[i].longitude, 'available': '0'});
      }
    }


    // Tuesday
    if ('Tuesday'=== moment().format('dddd')) {
      const istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, tue: '1',
      });
      for (let i=0; i<istrue.length; i++) {
        active.push({
          'doctor_name': istrue[i].doctor_name, 'Email': istrue[i].Email,
          'mobile_no': istrue[i].mobile_no,
          'ConsultingFees': istrue[i].ConsultinsgFees,
          'Address': istrue[i].Address,
          'time_interval': istrue[i].time_interval,
          'monday_from': istrue[i].monday_from,
          'monday_to': istrue[i].monday_to, 'tue_from': istrue[i].tue_from,
          'tue_to': istrue[i].tue_to, 'wed_from': istrue[i].wed_from,
          'wed_to': istrue[i].wed_to, 'thu_from': istrue[i].thu_from,
          'thu_to': istrue[i].to, 'fri_from': istrue[i].fri_from,
          'fri_to': istrue[i].fri_to, 'sat_from': istrue[i].sat_from,
          'sat_to': istrue[i].sat_to, 'sun_from': istrue[i].sun_from,
          'sun_to': istrue[i].sun_to, 'latitude': istrue[i].latitude,
          'longitude': istrue[i].longitude, 'available': '1'});
      }
    }
    if ('Tuesday'=== moment().format('dddd')) {
      const Istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, tue: '0',
      });
      for (let i=0; i<Istrue.length; i++) {
        active.push({
          'doctor_name': Istrue[i].doctor_name, 'Email': Istrue[i].Email,
          'mobile_no': Istrue[i].mobile_no,
          'ConsultingFees': Istrue[i].ConsultingFees,
          'Address': Istrue[i].Address,
          'time_interval': Istrue[i].time_interval,
          'monday_from': Istrue[i].monday_from,
          'monday_to': Istrue[i].monday_to, 'tue_from': Istrue[i].tue_from,
          'tue_to': Istrue[i].tue_to, 'wed_from': Istrue[i].wed_from,
          'wed_to': Istrue[i].wed_to, 'thu_from': Istrue[i].thu_from,
          'thu_to': Istrue[i].to, 'fri_from': Istrue[i].fri_from,
          'fri_to': Istrue[i].fri_to, 'sat_from': Istrue[i].sat_from,
          'sat_to': Istrue[i].sat_to, 'sun_from': Istrue[i].sun_from,
          'sun_to': Istrue[i].sun_to, 'latitude': Istrue[i].latitude,
          'longitude': Istrue[i].longitude, 'available': '0'});
      }
    }


    // Wednesday
    if ('Wednesday'=== moment().format('dddd')) {
      const istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, wed: '1',
      });
      for (let i=0; i<istrue.length; i++) {
        active.push({
          'doctor_name': istrue[i].doctor_name, 'Email': istrue[i].Email,
          'mobile_no': istrue[i].mobile_no,
          'ConsultingFees': istrue[i].ConsultingFees,
          'Address': istrue[i].Address,
          'time_interval': istrue[i].time_interval,
          'monday_from': istrue[i].monday_from,
          'monday_to': istrue[i].monday_to, 'tue_from': istrue[i].tue_from,
          'tue_to': istrue[i].tue_to, 'wed_from': istrue[i].wed_from,
          'wed_to': istrue[i].wed_to, 'thu_from': istrue[i].thu_from,
          'thu_to': istrue[i].to, 'fri_from': istrue[i].fri_from,
          'fri_to': istrue[i].fri_to, 'sat_from': istrue[i].sat_from,
          'sat_to': istrue[i].sat_to, 'sun_from': istrue[i].sun_from,
          'sun_to': istrue[i].sun_to, 'latitude': istrue[i].latitude,
          'longitude': istrue[i].longitude, 'available': '1'});
      }
    }
    if ('Wednesday'=== moment().format('dddd')) {
      const Istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, wed: '0',
      });
      for (let i=0; i<Istrue.length; i++) {
        active.push({
          'doctor_name': Istrue[i].doctor_name, 'Email': Istrue[i].Email,
          'mobile_no': Istrue[i].mobile_no,
          'ConsultingFees': Istrue[i].ConsultingFees,
          'Address': Istrue[i].Address,
          'time_interval': Istrue[i].time_interval,
          'monday_from': Istrue[i].monday_from,
          'monday_to': Istrue[i].monday_to, 'tue_from': Istrue[i].tue_from,
          'tue_to': Istrue[i].tue_to, 'wed_from': Istrue[i].wed_from,
          'wed_to': Istrue[i].wed_to, 'thu_from': Istrue[i].thu_from,
          'thu_to': Istrue[i].to, 'fri_from': Istrue[i].fri_from,
          'fri_to': Istrue[i].fri_to, 'sat_from': Istrue[i].sat_from,
          'sat_to': Istrue[i].sat_to, 'sun_from': Istrue[i].sun_from,
          'sun_to': Istrue[i].sun_to, 'latitude': Istrue[i].latitude,
          'longitude': Istrue[i].longitude, 'available': '0'});
      }
    }


    // Thursday
    if ('Thursday'=== moment().format('dddd')) {
      const istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, thu: '1',
      });
      for (let i=0; i<istrue.length; i++) {
        active.push({
          'doctor_name': istrue[i].doctor_name, 'Email': istrue[i].Email,
          'mobile_no': istrue[i].mobile_no,
          'ConsultingFees': istrue[i].ConsultingFees,
          'Address': istrue[i].Address,
          'time_interval': istrue[i].time_interval,
          'monday_from': istrue[i].monday_from,
          'monday_to': istrue[i].monday_to, 'tue_from': istrue[i].tue_from,
          'tue_to': istrue[i].tue_to, 'wed_from': istrue[i].wed_from,
          'wed_to': istrue[i].wed_to, 'thu_from': istrue[i].thu_from,
          'thu_to': istrue[i].to, 'fri_from': istrue[i].fri_from,
          'fri_to': istrue[i].fri_to, 'sat_from': istrue[i].sat_from,
          'sat_to': istrue[i].sat_to, 'sun_from': istrue[i].sun_from,
          'sun_to': istrue[i].sun_to, 'latitude': istrue[i].latitude,
          'longitude': istrue[i].longitude, 'available': '1'});
      }
    }
    if ('Thursday'=== moment().format('dddd')) {
      const Istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, thu: '0',
      });
      for (let i=0; i<Istrue.length; i++) {
        active.push({
          'doctor_name': Istrue[i].doctor_name, 'Email': Istrue[i].Email,
          'mobile_no': Istrue[i].mobile_no,
          'ConsultingFees': Istrue[i].ConsultingFees,
          'Address': Istrue[i].Address,
          'time_interval': Istrue[i].time_interval,
          'monday_from': Istrue[i].monday_from,
          'monday_to': Istrue[i].monday_to, 'tue_from': Istrue[i].tue_from,
          'tue_to': Istrue[i].tue_to, 'wed_from': Istrue[i].wed_from,
          'wed_to': Istrue[i].wed_to, 'thu_from': Istrue[i].thu_from,
          'thu_to': Istrue[i].to, 'fri_from': Istrue[i].fri_from,
          'fri_to': Istrue[i].fri_to, 'sat_from': Istrue[i].sat_from,
          'sat_to': Istrue[i].sat_to, 'sun_from': Istrue[i].sun_from,
          'sun_to': Istrue[i].sun_to, 'latitude': Istrue[i].latitude,
          'longitude': Istrue[i].longitude, 'available': '0'});
      }
    }

    // Friday

    if ('Friday'=== moment().format('dddd')) {
      const istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, fri: '1',
      });
      for (let i=0; i<istrue.length; i++) {
        active.push({
          'doctor_name': istrue[i].doctor_name, 'Email': istrue[i].Email,
          'mobile_no': istrue[i].mobile_no,
          'ConsultingFees': istrue[i].ConsultingFees,
          'Address': istrue[i].Address,
          'time_interval': istrue[i].time_interval,
          'monday_from': istrue[i].monday_from,
          'monday_to': istrue[i].monday_to, 'tue_from': istrue[i].tue_from,
          'tue_to': istrue[i].tue_to, 'wed_from': istrue[i].wed_from,
          'wed_to': istrue[i].wed_to, 'thu_from': istrue[i].thu_from,
          'thu_to': istrue[i].to, 'fri_from': istrue[i].fri_from,
          'fri_to': istrue[i].fri_to, 'sat_from': istrue[i].sat_from,
          'sat_to': istrue[i].sat_to, 'sun_from': istrue[i].sun_from,
          'sun_to': istrue[i].sun_to, 'latitude': istrue[i].latitude,
          'longitude': istrue[i].longitude, 'available': '1'});
      }
    }

    if ('Friday'=== moment().format('dddd')) {
      const Istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, fri: '0',
      });
      for (let i=0; i<Istrue.length; i++) {
        active.push({
          'doctor_name': Istrue[i].doctor_name, 'Email': Istrue[i].Email,
          'mobile_no': Istrue[i].mobile_no,
          'ConsultingFees': Istrue[i].ConsultingFees,
          'Address': Istrue[i].Address,
          'time_interval': Istrue[i].time_interval,
          'monday_from': Istrue[i].monday_from,
          'monday_to': Istrue[i].monday_to, 'tue_from': Istrue[i].tue_from,
          'tue_to': Istrue[i].tue_to, 'wed_from': Istrue[i].wed_from,
          'wed_to': Istrue[i].wed_to, 'thu_from': Istrue[i].thu_from,
          'thu_to': Istrue[i].to, 'fri_from': Istrue[i].fri_from,
          'fri_to': Istrue[i].fri_to, 'sat_from': Istrue[i].sat_from,
          'sat_to': Istrue[i].sat_to, 'sun_from': Istrue[i].sun_from,
          'sun_to': Istrue[i].sun_to, 'latitude': Istrue[i].latitude,
          'longitude': Istrue[i].longitude, 'available': '0'});
      }
    }

    // Saturday
    if ('Saturday'=== moment().format('dddd')) {
      const istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, sat: '1',
      });
      console.log(istrue);
      for (let i=0; i<istrue.length; i++) {
        active.push({
          'doctor_name': istrue[i].doctor_name, 'Email': istrue[i].Email,
          'mobile_no': istrue[i].mobile_no,
          'ConsultingFees': istrue[i].ConsultingFees,
          'Address': istrue[i].Address,
          'time_interval': istrue[i].time_interval,
          'monday_from': istrue[i].monday_from,
          'monday_to': istrue[i].monday_to, 'tue_from': istrue[i].tue_from,
          'tue_to': istrue[i].tue_to, 'wed_from': istrue[i].wed_from,
          'wed_to': istrue[i].wed_to, 'thu_from': istrue[i].thu_from,
          'thu_to': istrue[i].to, 'fri_from': istrue[i].fri_from,
          'fri_to': istrue[i].fri_to, 'sat_from': istrue[i].sat_from,
          'sat_to': istrue[i].sat_to, 'sun_from': istrue[i].sun_from,
          'sun_to': istrue[i].sun_to, 'latitude': istrue[i].latitude,
          'longitude': istrue[i].longitude, 'available': '1'});
      }
    }

    if ('Saturday'=== moment().format('dddd')) {
      const Istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, sat: '0',
      });
      for (let i=0; i<Istrue.length; i++) {
        active.push({
          'doctor_name': Istrue[i].doctor_name, 'Email': Istrue[i].Email,
          'mobile_no': Istrue[i].mobile_no,
          'ConsultingFees': Istrue[i].ConsultingFees,
          'Address': Istrue[i].Address,
          'time_interval': Istrue[i].time_interval,
          'monday_from': Istrue[i].monday_from,
          'monday_to': Istrue[i].monday_to, 'tue_from': Istrue[i].tue_from,
          'tue_to': Istrue[i].tue_to, 'wed_from': Istrue[i].wed_from,
          'wed_to': Istrue[i].wed_to, 'thu_from': Istrue[i].thu_from,
          'thu_to': Istrue[i].to, 'fri_from': Istrue[i].fri_from,
          'fri_to': Istrue[i].fri_to, 'sat_from': Istrue[i].sat_from,
          'sat_to': Istrue[i].sat_to, 'sun_from': Istrue[i].sun_from,
          'sun_to': Istrue[i].sun_to, 'latitude': Istrue[i].latitude,
          'longitude': Istrue[i].longitude, 'available': '0'});
      }
    }
    // console.log(moment().format('dddd'));
    // Sunday
    if ('Sunday'=== moment().format('dddd')) {
      const istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, sun: '1',
      });
      for (let i=0; i<istrue.length; i++) {
        active.push({
          'doctor_name': istrue[i].doctor_name, 'Email': istrue[i].Email,
          'mobile_no': istrue[i].mobile_no,
          'ConsultingFees': istrue[i].ConsultingFees,
          'Address': istrue[i].Address,
          'time_interval': istrue[i].time_interval,
          'monday_from': istrue[i].monday_from,
          'monday_to': istrue[i].monday_to, 'tue_from': istrue[i].tue_from,
          'tue_to': istrue[i].tue_to, 'wed_from': istrue[i].wed_from,
          'wed_to': istrue[i].wed_to, 'thu_from': istrue[i].thu_from,
          'thu_to': istrue[i].to, 'fri_from': istrue[i].fri_from,
          'fri_to': istrue[i].fri_to, 'sat_from': istrue[i].sat_from,
          'sat_to': istrue[i].sat_to, 'sun_from': istrue[i].sun_from,
          'sun_to': istrue[i].sun_to, 'latitude': istrue[i].latitude,
          'longitude': istrue[i].longitude, 'available': '1'});
      }
    }

    if ('Sunday'=== moment().format('dddd')) {
      const Istrue = await DocCli.find({
        DoctorId: req.query.DoctorId, sun: '0',
      });
      for (let i=0; i<Istrue.length; i++) {
        active.push({
          'doctor_name': Istrue[i].doctor_name, 'Email': Istrue[i].Email,
          'mobile_no': Istrue[i].mobile_no,
          'ConsultingFees': Istrue[i].ConsultingFees,
          'Address': Istrue[i].Address,
          'time_interval': Istrue[i].time_interval,
          'monday_from': Istrue[i].monday_from,
          'monday_to': Istrue[i].monday_to, 'tue_from': Istrue[i].tue_from,
          'tue_to': Istrue[i].tue_to, 'wed_from': Istrue[i].wed_from,
          'wed_to': Istrue[i].wed_to, 'thu_from': Istrue[i].thu_from,
          'thu_to': Istrue[i].to, 'fri_from': Istrue[i].fri_from,
          'fri_to': Istrue[i].fri_to, 'sat_from': Istrue[i].sat_from,
          'sat_to': Istrue[i].sat_to, 'sun_from': Istrue[i].sun_from,
          'sun_to': Istrue[i].sun_to, 'latitude': Istrue[i].latitude,
          'longitude': Istrue[i].longitude, 'available': '0'});
      }
    }
    res.status(200).json({status: 'success', data: active});
  } catch (err) {
    console.log(err);
  }
};

exports.listdocs = async (req, res, next) => {
  try {
    const istrue = await doctors.find({email: req.query.email});
    if (istrue.length === 0) {
      return res.status(401).json({status: 'Doctor Not Found', data: ''});
    }
    const details = [];
    for (let i=0; i<istrue.length; i++) {
      details.push({'DoctorName': istrue[i].doctor_name,
        'Email': istrue[i].email, 'MobileNo': istrue[i].mobile_no,
        '_id': istrue[i]._id});
    }
    res.status(200).json({status: 'success', data: details});
  } catch (err) {
    console.log(err);
  }
};

exports.GetEmail = async (req, res, next) => {
  try {
    const istrue = await ClinicReg.findOne({ResetToken: req.params.token});
    if (istrue.length === 0) {
      return res.status(200).json({status: 'Your token is expired'});
    }
    const email = [];
    email.push({Email: istrue.Email});
    res.status(200).json({status: 'success', data: email});
  } catch (err) {
    console.log(err);
  }
};

