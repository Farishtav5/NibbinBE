/**
 * Comments.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    message: {
      type: "string",
      required: true,
    },
    commentedBy:{
      model: "user",
    },
    newsId: {
      model: 'News'
    },
    requestModification:{
      type: "json",
    },
  },

};

