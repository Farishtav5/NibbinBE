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
    headline: {
      type: "json",
      required: true,
    },
    imageSrc: {
      type: "Json"
    },
    imageSourceName: {
      type: "string",
      defaultsTo: 'BluOne'
    },
    shortDesc: {
      type: "Json"
    },
    link: {
      type: "json"
    },
    type: {
      type: "json",
      defaultsTo: "news"
    },
    // [
    //   {text: 'In Queue', value: 'in-queue'}, //
    //   {text: 'Published', value: 'published'}, //
    //   {text: 'Approved', value: 'approved'}, //
    //   {text: 'Edit Required', value: 'edit-required'}, //
    //   {text: 'Scheduled', value: 'scheduled'}, //
    //   // {text: 'Assigned', value: 'assigned'},
    //   {text: 'Rejected', value: 'rejected'}, //
    //   {text: 'On Hold', value: 'on-hold'}, //
    //   {text: 'Summarized', value: 'summarized'}
    // ]
    status: {
      type: "string",
      isIn:['in-queue', 'published', 'edit-required', 'approved', 'submitted', 'on-hold', 'scheduled', 'rejected', 'summarized'],
      defaultsTo: 'in-queue'
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
    comments: {
      collection: 'Comments',
      via: 'newsId'
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

