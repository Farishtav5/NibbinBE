/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
var bcrypt = require("bcrypt");

module.exports = {

  attributes: {
    name: {
      type: "string",
      required: true,
    },
    email : {
      type: "string",
      required: true,
      unique: true,
    },
    password: {
      type: "String",
    },
    categories: {
      collection: "category",
      via: "users"
    },

  },

  beforeCreate: function (values, cb) {
    bcrypt.hash(values.password, 10, function (err, hash) {
      if (err) return cb(err);
      values.password = hash;
      cb();
    });
  },

  comparePassword: function (password, user) {
    return new Promise(function (resolve, reject) {
      bcrypt.compare(password, user.password, function (err, match) {
        if (err) reject(err);
        if (match) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
    });
  },

  customToJSON: function(){
    return _.omit(this,["password"]);
  }

};

