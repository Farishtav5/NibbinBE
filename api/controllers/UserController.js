/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {

    get: async function (req, res) {
        let id = req.param('id');
        let result = await User.find({ id: id }).populate('categories').populate('bookmarks');
        res.send(result);
    },

    getMyProfile: async function (req, res) {
        let result = await User.find({ id: req.currentUser.id }).populate('categories').populate('bookmarks');
        res.send(result);
    },
    updateMyProfile: async function (req, res) {
        let params = req.allParams();
        let objUserFound = await User.findOne({ id: req.currentUser.id }).intercept('UsageError', (err) => {
            err.message = 'Uh oh: ' + err.message;
            return ResponseService.json(400, res, "getting error when User find", err);
        });
        if (objUserFound){
            let dataToUpdate = {
                enableNotification: params.notification
            }
            var updatedUser = await User.updateOne({ id: req.currentUser.id }).set(dataToUpdate);
            if (updatedUser) {
                return ResponseService.json(200, res, "user updated successfully", updatedUser);
            }
            else {
                return ResponseService.json(400, res, "User not found");
            }
        }else{
            return ResponseService.json(400, res, "User not found");
        }
    },

    setUserInterestCategories: async function (req, res) {
        let params = req.allParams();
        console.log('set categoryIds', params.categoryIds);
        let result = await User.replaceCollection(req.currentUser.id, 'categories').members(params.categoryIds);
        return ResponseService.json(200, res, "set categories successfully", result);
    },

    create: async function (req, res) {
        let item = req.allParams();
        if (item.password !== item.confirmPassword) {
            return ResponseService.json(400, res, "Password doesn't match");
        }
        let allowedParameters = ["email", "password"];
        let data = _.pick(item, allowedParameters);

        let IsUserExist = await User.findOne({
            email: req.param('email')
        });
        if (IsUserExist) {
            return ResponseService.json(400, res, "email already in used");
        } else {
            let newUserRecord = await User.create({
                name: item.name,
                email: item.email,
                password: item.password
            }).intercept('UsageError', (err) => {
                err.message = 'Uh oh: ' + err.message;
                return ResponseService.json(400, res, "User could not be created", err);
            }).fetch();

            if (newUserRecord) {
                return ResponseService.json(200, res, "User created successfully", newUserRecord);
            } else {
                return ResponseService.json(400, res, "User could not be created");
            }
        }


    }

};

