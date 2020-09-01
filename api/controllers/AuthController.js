/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    login: async function (req, res) {
        let items = req.allParams();
        let email = items.email;
        let password = items.password;
        verifyParams(res, email, password);
        if (email && password) {
            let foundUser = await User.findOne({
                email: email
            });
            if (!foundUser) {
                return invalidEmailOrPassword(res);
            }
            signInUser(req, res, password, foundUser);
        }

    },

};

function signInUser(req, res, password, user) {
    let userinfo = {
        name: user.name,
        email: user.email
    };
    User.comparePassword(password, user).then(
        function (valid) {
            if (!valid) {
                return invalidEmailOrPassword(res);
            } else {
                let responseData = {
                    user: userinfo,
                    token: generateToken(user.id)
                }
                return ResponseService.json(200, res, "Successfully signed in", responseData);
            }
        }
    ).catch(function (err) {
        console.log('catch : ', err);
        return ResponseService.json(403, res, "Forbidden");
    })
};

function invalidEmailOrPassword(res) {
    return ResponseService.json(400, res, "Invalid email or password")
};

function verifyParams(res, email, password) {
    if (!email || !password) {
        return ResponseService.json(400, res, "Email and password required")
    }
};

function generateToken(client_id) {
    return JwtService.issue({
        id: client_id
    })
};
