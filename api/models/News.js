/**
 * News.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "news",
  attributes: {
    title: {
      type: "Json",
      required: true
    },
    imageSrc: {
      type: "Json"
    },
    shortDesc: {
      type: "Json"
    },
    status: {
      type: "string",
      isIn:['in-queue', 'published', 'edit-required']
    },
    scheduledTo: {
      type: "ref",
      columnType: "datetime"
    },
    dated: {
      type: "ref",
      columnType: "datetime"
    },
    publishedAt: {
      type: "ref",
      columnType: "datetime"
    },
    categories: {
      collection: "category",
      via: "news"
    },
    createdBy: {
      model: "user",
      required: true,
    },
    updatedBy: {
      model: "user",
      required: true,
    }



    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },
  // customToJSON: function(){ 
  //   return _.omit(this, ['title','createdBy']);
  // }

};

