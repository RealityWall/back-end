'use strict';

const config = require('../../../constants.js');
const MAILER = config.MAILER;
const DEPLOY_BASE_URL = config.DEPLOY_BASE_URL;
const nodemailer = require('nodemailer');
const fs = require('fs');
const transporter = nodemailer.createTransport("smtps://" + MAILER.LOGIN + ":" + MAILER.PASSWORD + "@ssl0.ovh.net");

module.exports = {

    sendVerificationMail(user, verificationToken) {
        const url = DEPLOY_BASE_URL + '/verify/' + verificationToken;
        const subject = '[Un Mur Dans Le Réel] Mail de confirmation de création de compte';

        fs.readFile(__dirname + '/assets/register/register.txt', 'utf8', (err, data) => {
            if (err) return err;
            const mailText = data
                .replace(/{{firstname}}/g, user.firstname)
                .replace(/{{lastname}}/g, user.lastname)
                .replace(/{{url}}/g, url);

            fs.readFile(__dirname + '/assets/register/register.html', 'utf8', (err, data) => {
                if (err) return err;
                const mailHtml = data
                    .replace(/{{firstname}}/g, user.firstname)
                    .replace(/{{lastname}}/g, user.lastname)
                    .replace(/{{url}}/g, url)
                    .replace(/{{subject}}/g, subject);

                const mailOptions = {
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
        const url = DEPLOY_BASE_URL + '/reset-password/' + token;
        const subject = '[Un Mur Dans Le Réel] Mot de passe oublié';

        fs.readFile(__dirname + '/assets/reset-password/reset-password.txt', 'utf8', (err, data) => {
            if (err) return err;
            const mailText = data
                .replace(/{{firstname}}/g, user.firstname)
                .replace(/{{lastname}}/g, user.lastname)
                .replace(/{{url}}/g, url);

            fs.readFile(__dirname + '/assets/reset-password/reset-password.html', 'utf8', (err, data) => {
                if (err) return err;
                const mailHtml = data
                    .replace(/{{firstname}}/g, user.firstname)
                    .replace(/{{lastname}}/g, user.lastname)
                    .replace(/{{url}}/g, url)
                    .replace(/{{subject}}/g, subject);

                const mailOptions = {
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

    sendCreatedMail(user, type) {
        // TODO
        console.info('TODO');
        if (type === 'organization') {

        } else if (type === 'member') {

        }
    }

};


