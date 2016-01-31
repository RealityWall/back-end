var bcrypt = require('bcryptjs');

module.exports = {
    /**
     * Generate Password
     * @param origin
     */
    generate(origin) {
        return new Promise( (resolve, reject) => {
            bcrypt.hash(origin, 8, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        })
    },
    /**
     * Check password
     * @param cryptedPassword password from the db
     * @param password password from the req.body
     */
    check(cryptedPassword, password) {
        return new Promise( (resolve, reject) => {
            bcrypt.compare(password, cryptedPassword, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
};