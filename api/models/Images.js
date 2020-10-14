/**
 * Images.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    //
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
  },

};

