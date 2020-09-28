/**
 * RolesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getAllRoles: async function (req, res) {
    let result = await Roles.find().intercept("UsageError", (err) => {
      err.message = "Uh oh: " + err.message;
      return ResponseService.json(400, res, "getting all roles error", err);
    });
    return ResponseService.json(200, res, "getting all roles", result);
  },

  createNewRole: async function (req, res) {
    let params = req.allParams();
    let createdRoleObj = await Roles.create({
      name: params.name,
      createdBy: req.currentUser ? req.currentUser.id : "",
      updatedBy: req.currentUser ? req.currentUser.id : "",
    })
      .intercept("UsageError", (err) => {
        err.message = "Uh oh: " + err.message;
        return ResponseService.json(400, res, "Role could not be create", err);
      })
      .fetch();

    if (createdRoleObj) {
      return ResponseService.json(200, res, "added new role", createdRoleObj);
    } else {
      return ResponseService.json(400, res, "Role could not be create");
    }
  },

  updateRole: async function (req, res) {
    let params = req.allParams();

    if (!params.id) {
      return ResponseService.json(400, res, "please provide role id");
    }

    let objUpdate = {
      updatedBy: req.currentUser ? req.currentUser.id : "",
    };

    if (params.name) objUpdate.name = params.name;
    //published News permissions
    if(params.view) objUpdate.view = params.view;
    if(params.date) objUpdate.date = params.date;
    //Table Columns permissions
    if(params.newsHeadline) objUpdate.newsHeadline = params.newsHeadline;
    if(params.group) objUpdate.group = params.group;
    if(params.linkAdded) objUpdate.linkAdded = params.linkAdded;
    if(params.approved) objUpdate.approved = params.approved;
    if(params.assigned) objUpdate.assigned = params.assigned;
    if(params.schedule) objUpdate.schedule = params.schedule;
    if(params.published) objUpdate.published = params.published;
    if(params.link) objUpdate.link = params.link;
    if(params.submit) objUpdate.submit = params.submit;

    let updatedObj = await Roles.update({
      id: params.id,
    })
      .set(objUpdate)
      .intercept("UsageError", (err) => {
        err.message = "Uh oh: " + err.message;
        return ResponseService.json(400, res, "Role could not be create", err);
      })
      .fetch();

    if (updatedObj) {
      return ResponseService.json(200, res, "Role updated", updatedObj);
    } else {
      return ResponseService.json(400, res, "Role could not be update");
    }
  },

  deleteRole: async function (req, res) {
    let params = req.allParams();
    if (!params.id) {
      return ResponseService.json(400, res, "please provide role id");
    }
    let result = await Roles.archiveOne({ id: params.id });
    res.send(result);
},
};
