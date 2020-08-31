var jwt = require('jsonwebtoken');
var jwtSecret = sails.config.secrets.jwtSecret;

module.exports = {
    issue: function (payload) {
        // token = jwt.sign(payload, jwtSecret, {
        //   expiresIn: 180 * 60
        // })
        token = jwt.sign(payload, jwtSecret)
        return token
    },

    verify: function (token, callback) {
        return jwt.verify(token, jwtSecret, callback);
    }
}