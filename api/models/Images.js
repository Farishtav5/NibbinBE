/**
 * Images.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    //
    excelId:{
      type: "string"
    },
    imageSrc: {
      type: "Json"
    },
    imageSourceName: {
      type: "string",
      defaultsTo: 'BluOne'
    },
    tags: {
      type: "json",
    },
    categories: {
      collection: "category",
      via: "images"
    },
    createdDateTime: {
      type: "ref",
      columnType: "datetime"
    },
  },

  beforeCreate: function (values, cb) {
    values.createdDateTime = new Date();
    cb();
  },

};

