var bcrypt = require('bcryptjs');

// TODO : make it async for better performance

module.exports = {
    /**
     * Generate Password
     * @param origin
     */
    generate: function(origin) {
        return bcrypt.hashSync(origin, 8);
    },
    /**
     * Check password
     * @param cryptedPassword password from the db
     * @param password password from the req.body
     */
    check: function (cryptedPassword, password) {
        return bcrypt.compareSync(password, cryptedPassword);
    }
};