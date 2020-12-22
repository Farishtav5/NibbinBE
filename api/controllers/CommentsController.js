/**
 * CommentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createNewComment: async function (req, res) {
    let params = req.allParams();

    if (!params.newsId) {
      return ResponseService.json(400, res, "please provide news id");
    }

    let createObj = {
      message: params.message,
      commentedBy: req.currentUser ? req.currentUser.id : "",
      newsId: params.newsId,
      requestModification: params.requestModification,
    };

    let createdCommentObj = await Comments.create(createObj)
      .intercept("UsageError", (err) => {
        err.message = "Uh oh: " + err.message;
        return ResponseService.json(400, res, "Comment could not be create", err);
      })
      .fetch().usingConnection(sails.config.db);

    if (createdCommentObj) {
      return ResponseService.json(200, res, "added new Comment", createdCommentObj);
    } else {
      return ResponseService.json(400, res, "Comment could not be create");
    }
  },
};
