/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {

    get: async function (req, res) {
        let id = req.param('id');
        let result = await User.find({ id: id }).populate('categories').populate('bookmarks').populate('role');
        res.send(result);
    },

    getMyProfile: async function (req, res) {
        let result = await User.find({ id: req.currentUser.id }).populate('categories').populate('bookmarks').populate('role');
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
        let IsUserExist = await User.findOne({
            email: req.param('email')
        });
        if (IsUserExist) {
            return ResponseService.json(400, res, "email already in used");
        } else {
            let data = {
                name: item.name,
                email: item.email,
                password: '123456',
            }
            if(item.role){
                data.role = item.role
            }
            let newUserRecord = await User.create(data).intercept('UsageError', (err) => {
                err.message = 'Uh oh: ' + err.message;
                return ResponseService.json(400, res, "User could not be created", err);
            }).fetch();

            if (newUserRecord) {
                return ResponseService.json(200, res, "User created successfully", newUserRecord);
            } else {
                return ResponseService.json(400, res, "User could not be created");
            }
        }


    },

    updateUserDetail: async function (req, res) {
        let params = req.allParams();
        if(!params.id){
            return ResponseService.json(400, res, "please provide user id");
        }
        let objUserFound = await User.findOne({ id: params.id }).intercept('UsageError', (err) => {
            err.message = 'Uh oh: ' + err.message;
            return ResponseService.json(400, res, "getting error when User find", err);
        });
        if (objUserFound){
            let dataToUpdate = {};
            if(params.name) dataToUpdate.name = params.name;
            if(params.status) dataToUpdate.status = params.status;
            if(params.role) dataToUpdate.role = params.role;

            var updatedUser = await User.updateOne({ id: params.id }).set(dataToUpdate);
            if (updatedUser) {
                return ResponseService.json(200, res, "user updated successfully", updatedUser);
            }
            else {
                return ResponseService.json(400, res, "User not found");
            }
        }else{
            return ResponseService.json(400, res, "User not found");
        }
    }

};

