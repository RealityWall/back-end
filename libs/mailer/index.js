'use strict';

let config = require('../../../constants.js');
let MAILER = config.MAILER;
let DEPLOY_BASE_URL = config.DEPLOY_BASE_URL;
let nodemailer = require('nodemailer');
let fs = require('fs');
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: MAILER.LOGIN,
        pass: MAILER.PASSWORD
    }
});

module.exports = {

    sendVerificationMail(user, verificationToken) {
        let url = DEPLOY_BASE_URL + '/verify/' + verificationToken;
        let subject = '[Un Mur Dans Le Réel] Mail de confirmation de création de compte';

        let mailText = '';
        let mailHtml = '';
        fs.readFile(__dirname + '/assets/register/register.txt', 'utf8', (err, data) => {
            if (err) return err;
            mailText = data
                .replace(/{{firstname}}/g, user.firstname)
                .replace(/{{lastname}}/g, user.lastname)
                .replace(/{{url}}/g, url);

            fs.readFile(__dirname + '/assets/register/register.html', 'utf8', (err, data) => {
                if (err) return err;
                mailHtml = data
                    .replace(/{{firstname}}/g, user.firstname)
                    .replace(/{{lastname}}/g, user.lastname)
                    .replace(/{{url}}/g, url)
                    .replace(/{{subject}}/g, subject);

                let mailOptions = {
                    from: 'Un Mur Dans Le Réel <' + MAILER.LOGIN + '>',
                    to: user.email,
                    subject: subject,
                    text: mailText,
                    html: mailHtml
                };

                transporter.sendMail(mailOptions, function() {});
            });
        });
    },

    sendPasswordResetLink(user, token) {
        let url = DEPLOY_BASE_URL + '/reset-password/' + token;
        let subject = '[Un Mur Dans Le Réel] Mot de passe oublié';

        let mailText = '';
        let mailHtml = '';
        fs.readFile(__dirname + '/assets/reset-password/reset-password.txt', 'utf8', (err, data) => {
            if (err) return err;
            mailText = data
                .replace(/{{firstname}}/g, user.firstname)
                .replace(/{{lastname}}/g, user.lastname)
                .replace(/{{url}}/g, url);

            fs.readFile(__dirname + '/assets/reset-password/reset-password.html', 'utf8', (err, data) => {
                if (err) return err;
                mailHtml = data
                    .replace(/{{firstname}}/g, user.firstname)
                    .replace(/{{lastname}}/g, user.lastname)
                    .replace(/{{url}}/g, url)
                    .replace(/{{subject}}/g, subject);

                let mailOptions = {
                    from: 'Un Mur Dans Le Réel <' + MAILER.LOGIN + '>',
                    to: user.email,
                    subject: subject,
                    text: mailText,
                    html: mailHtml
                };

                transporter.sendMail(mailOptions, function() {});
            });
        });
    }

};


