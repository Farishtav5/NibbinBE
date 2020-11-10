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
    slug: {
      type: "string"
    },
    // imageSrc: {
    //   type: "Json"
    // },
    // imageSourceName: {
    //   type: "string",
    //   defaultsTo: 'BluOne'
    // },
    imageId:{
      model: "images",
    },
    excel_id:{
      type: "string"
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
      // isIn:['in-queue', 'published', 'edit-required', 'approved', 'submitted', 'on-hold', 'scheduled', 'rejected', 'summarized'],
      // isIn:['in-queue', 'url-approved', 'design-submitted', 'content-submitted', 'in-review', 'edit-required', 'published', 'scheduled', 'rejected', 'on-hold'],
      isIn:[
        'in-queue',
        'in-content',
        'draft',
        'in-design',
        'in-review',
        'edit-required',
        'published',
        'scheduled',
        'rejected',
        'on-hold',
        'auto-scheduled'
      ],
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
    },
    contentSubmitted: {
      type: 'boolean',
      defaultsTo: false
    },
    designSubmitted: {
      type: 'boolean',
      defaultsTo: false
    },
    metaSource: {
      type: "json"
    },
    delete: {
      type: 'boolean',
      defaultsTo: false
    },
    send_notification: {
      type: 'boolean',
      defaultsTo: true
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

