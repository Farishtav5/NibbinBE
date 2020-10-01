/**
 * Roles.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: "string",
      required: true,
    },
    published_view:{
      type: "json",
      defaultsTo:{
        view: false,
        date: false
      }
    },
    table:{
      type: "json",
      defaultsTo: {
        newsHeadline: false,
        group: false,
        linkAdded: false,
        approved: false,
        assigned: false,
        schedule: false,
        published: false,
        link: false,
        submit: false,
      }
    },

    //published News permissions
    // view: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    // date: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    
    //Table Columns permissions
    // newsHeadline: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    // group: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    // linkAdded: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    // approved: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    // assigned: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    // schedule: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    // published: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    // link: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    // submit: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    delete: {
      type: 'boolean',
      defaultsTo: false
    },
    createdBy:{
      model: "user",
    },
    updatedBy:{
      model: "user",
    }
  },
  customToJSON: function(){
    return _.omit(this,["delete"]);
  }

};

