/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const GOOGLE = {
    ANDROID_CLIENT_ID: sails.config.custom.google_web_client_id,
    IOS_CLIENT_ID: sails.config.custom.google_ios_client_id
}

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

    verifyGoogleLogin: async function (req, res) {
        const { OAuth2Client } = require('google-auth-library');
        console.log('verifyGoogleLogin : ', req.method);

        let items = req.allParams();
        let token = items.token;
        let _clientId = "";
        if(!items.os){
            return ResponseService.json(400, res, "Please pass OS param");
        }
        if (items.os === 'android'){
            _clientId = GOOGLE.ANDROID_CLIENT_ID;
        }else if(items.os === 'ios'){
            _clientId = GOOGLE.IOS_CLIENT_ID;
        }
        const client = new OAuth2Client(_clientId);
        
        // try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: _clientId,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            if (ticket) {
                const payload = ticket.getPayload();
                if (payload) {
                    const googleId = payload['sub'];
                    const userInfo = {
                        name: payload["name"] || payload["given_name"],
                        email: payload["email"],
                        googleId: googleId,
                        email_verified: payload["email_verified"],
                        picture: payload["picture"],
                    }
                    if (googleId && userInfo){
                        let IsUserExist = await User.findOne({
                            email: userInfo.email
                        }).intercept('UsageError', (err) => {
                            err.message = 'Uh oh: ' + err.message;
                            return ResponseService.json(400, res, err);
                        });
                        let responseData = undefined;
                        if (IsUserExist){
                            responseData = {
                                user: {
                                    name: IsUserExist.name,
                                    email: IsUserExist.email,
                                    profilePic: IsUserExist.profilePic
                                },
                                token: generateToken(IsUserExist.id)
                            }
                        }else{
                            let newUserRecord = await User.create({
                                name: userInfo.name,
                                email: userInfo.email,
                                googleId: googleId,
                                profilePic: userInfo.picture
                            }).intercept('UsageError', (err) => {
                                err.message = 'Uh oh: ' + err.message;
                                return ResponseService.json(400, res, "User could not be created", err);
                            }).fetch();
                            responseData = {
                                user: {
                                    name: newUserRecord.name,
                                    email: newUserRecord.email,
                                    profilePic: newUserRecord.profilePic
                                },
                                token: generateToken(newUserRecord.id)
                            }
                            
                        }
                        return ResponseService.json(200, res, "Successfully signed in", responseData);
                    }else{
                        return ResponseService.json(400, res, "not getting google id");
                    }
                }
            }else{
                console.log('else part : ticket not found');
                let err = { error: "Something went wrong in else" }
                return ResponseService.json(400, res, "Error:", err);
            }
            
        // } catch (err) {
        //     console.log('catch part : found error');
        //     err = _.isEmpty(err) ? { error: "Something went wrong" } : err; 
        //     return ResponseService.json(400, res, "Error:", err);
        // }
        
    }

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
