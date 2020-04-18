var nodemailer = require('nodemailer');
// in auth user and password please provide valid email-id and password of that id
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'xyx@gmail.com',
    pass: '****'
  }
});

var mailOptions = {
  from: 'lovelykumari1it@gmail.com',
  to: 'lovelykumari1it@gmail.com',
  subject: 'Invoice of booked tickets',
  text: `Dear customer, 
         Thank you for booking ticket with BookMyShow App.
          please keep visiting us.
          And your invoice detail is:--

          Thanks And Regards.
          BookMyShow Team.`       
};
module.exports ={
  transporter,
  mailOptions
};

