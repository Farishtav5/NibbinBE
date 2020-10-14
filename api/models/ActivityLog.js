/**
 * ActivityLog.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    //
    newsId: {
      model: "News"
    },
    createdBy: {
      model: "User"
    },
    type: {
      type: "string",
      defaultsTo: "news"
    },
    message: {
      type: "string",
    },
    createdDateTime: {
      type: "ref",
      columnType: "datetime"
    },
    action:{
      type: "string",
    },
    delete: {
      type: 'boolean',
      defaultsTo: false
    },
  },
  
  beforeCreate: function (values, cb) {
    values.createdDateTime = new Date();
    cb();
  },

  customToJSON: function(){
    return _.omit(this,["action", "delete"]);
  }

};

