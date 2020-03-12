//发邮件，由upload.js调用
const nodemailer = require('nodemailer');

async function sendEmail(outputFile, fileUrl, username){
	return await helper(outputFile, fileUrl, username);
}

function helper(outputFile, fileUrl, username ){

	//Email setting
	let transporter = nodemailer.createTransport({
	  service: 'Outlook365',
	  port: 587,
	  secure: false,
	  auth: {
	    user: 'jyn34@mail.missouri.edu',
	    pass: 'ycJK3323858067'
	  }
	})

  //Send Email
  let mailOptions = {
    from: '<jyn34@mail.missouri.edu>', // sender address
    to: username, // list of receivers
    subject: 'Thank you for visiting MusiteDeep !', // Subject line
    // 发送text或者html格式
    text: 'Your output file is attached !', // plain text body
    //html: '<b>Hello world?</b>' // html body
    attachments: 
               	[
                  {
                    filename: outputFile,
                    path: fileUrl,
                    cid: '00000001'
                  }

                ]
  };

  return new Promise((resolve, reject) => {
	  transporter.sendMail(mailOptions, (error, info) => {
	    if (error) {
	      console.log(error);
	      resolve(error);
	    }
	    else {
	    	console.log('Message sent: %s', info.messageId);
	    	resolve('Email sent.')
	    }
	  }); 	
  })

}

module.exports = sendEmail;