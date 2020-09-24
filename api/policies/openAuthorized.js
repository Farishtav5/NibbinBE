/**
 * openAuthorized
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

module.exports = function (req, res, next) {
    let token;

    if (req.isSocket) _auth = req.headers.Authorization;
    // else _auth = (req.headers.Authorization || req.headers.authorization);
    else _auth = req.header('Authorization');
    // console.log('isAuthorized : ',req.method + '->' + req.url);
    if (req.headers && _auth) {
        let parts = _auth.split(' ');
        if (parts.length == 2) {
            let scheme = parts[0],
                credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else {
            return ResponseService.json(400, res, "Format is Authorization: Bearer [token]");
        }
    } else if (req.param('token')) {
        token = req.param('token');
        delete req.query.token;
    }

    if(token){
        JwtService.verify(token, async function (err, decoded) {
            if (err) return ResponseService.json(400, res, "Invalid Token!");
            req.token = token;
            if (typeof decoded != 'undefined') {
                User.findOne({
                    id: decoded.id
                }).exec(function (error, currentUser) {
                    if (error || !currentUser) return ResponseService.json(400, res, "Invalid Token!");
                    req.currentUser = currentUser;
                    if(decoded && decoded.accessSourceType){
                        req.accessSourceType = decoded.accessSourceType;
                    }
                    next();
                });
            } else return ResponseService.json(401, res, "You are not permitted to perform this action.");
        });
    }else{
        next();
    }

}