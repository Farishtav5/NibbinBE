module.exports = {
  friendlyName: "Create activity log",

  description: "",

  inputs: {
    newsId: {
      type: "number",
      example: 1,
      description: "The Id of News",
      required: true,
    },
    createdBy: {
      type: "number",
      example: 1,
      description: "The Id of User",
      required: true,
    },
    type: {
      type: "string",
      example: "news",
      description: "The type of activity like news",
    },
    status: {
      type: "string",
      example: "in-queue",
      description: "The status of news",
    },
    message: {
      type: "string",
      example: "News approved",
      description: "The type of activity like news",
    },
    action: {
      type: "string",
      example: "Controller - Action",
      description: "action hit by controller",
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    // TODO
    let data = {
      newsId: inputs.newsId,
      createdBy: inputs.createdBy,
      type: inputs.type,
      message: inputs.message ? inputs.message : '-',
      action: inputs.action ? inputs.action : '',
    };
    let _message = null;
    let _activites = Utilities.activities;

    switch (inputs.status) {
      case _activites.NEWS.STATUS.IN_QUEUE:
        _message = "News Created";
        break;
      case _activites.NEWS.STATUS.IN_CONTENT:
        _message = "News Approved";
        break;
      case _activites.NEWS.STATUS.DRAFT:
        _message = "News saved as draft";
        break;
      case _activites.NEWS.STATUS.IN_DESIGN:
        _message = "News status has been updated to add design";
        break;
      case _activites.NEWS.STATUS.IN_REVIEW:
        _message = "News status has been updated to in review";
        break;
      case _activites.NEWS.STATUS.EDIT_REQUIRED:
        _message = "News status has been updated to edit required";
        break;
      case _activites.NEWS.STATUS.PUBLISHED:
        _message = "News status has been updated to published now";
        break;
      case _activites.NEWS.STATUS.SCHEDULED:
        _message = "News has been scheduled for publish";
        break;
      case _activites.NEWS.STATUS.REJECTED:
        _message = "News has been rejected";
        break;
      case _activites.NEWS.STATUS.ON_HOLD:
        _message = "News status has been updated to on hold";
        break;

      // default:
      //   _message = "News status updated";
      //   break;
    }

    data.message = _message ? _message : data.message;
    let created = await ActivityLog.create(data)
      .intercept({ name: "UsageError" }, (err) => {
        return "invalid";
      })
      .fetch();

    return exits.success(created);
  },
};
