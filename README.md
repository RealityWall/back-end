# Back End of the Reality Wall app

Welcome ! If you want to contribute, do not hesitate to contact us, we enjoy working with awesome people like you :)

## How To Run Server

First, you have to get a constants.js file at the same level of the back-end folder containing :
```javascript
{
    POSTGRES: {
        USERNAME: 'username',
        PASSWORD: 'password',
        HOST: 'LOCALHOST <3'
    },

    MAILER: {
        LOGIN: 'AnAmazingMail@gmail.com',
        PASSWORD: 'OhShitIJustForgot...'
    },

    DEPLOY_BASE_URL: 'http://localhost:8080/#!', // URL OF THE FRONT END (For link sent in mails)

    SERVER: {
        BASE_URL: 'http://localhost:3000' // URL USEFULL WHEN GENRATING POST FOR ADMIN
    }
}
```

Then, you have to run an PostgreSQL Server

Finally just run `node index.js`

## How To Run Tests

Just run `mocha` (with PostgreSQL Server Launched)
