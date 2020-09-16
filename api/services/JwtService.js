var jwt = require('jsonwebtoken');
var jwtSecret = sails.config.secrets.jwtSecret;

module.exports = {
    issue: function (payload) {

        let token;
        if (payload.accessSourceType) {
            token = jwt.sign(payload, jwtSecret, {
                expiresIn: '24h'
                // expiresIn: 180 * 60
            })
        } else {
            token = jwt.sign(payload, jwtSecret)
        }
        return token
    },

    verify: function (token, callback) {
        return jwt.verify(token, jwtSecret, callback);
    }
}