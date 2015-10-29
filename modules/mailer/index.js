var mailer = require('nodemailer');

var transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'reality.wall@gmail.com',
        pass: 'passwordrealitywall'
    }
});

module.exports = {
    send: function (object, callback) {
        transporter.sendMail({
            from: 'reality.wall@gmail.com',
            to: object.to,
            subject: object.subject,
            text: object.text
        }, callback);
    }
};