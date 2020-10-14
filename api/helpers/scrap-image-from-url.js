const fs = require("fs");
const cheerio = require("cheerio");
const got = require("got");

function isUrl(s) {
  var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(s);
}

module.exports = {
  friendlyName: "Scrap image from url",

  description: "",

  inputs: {
    url: {
      type: "string",
      example: "http://google.com",
      description: "Url of source link",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    // TODO
    console.log("before request");
    if (!inputs.url) {
      return exits.success(false);
    }
    if (!isUrl(inputs.url)) {
      return exits.success(false);
    }
    let _targetUrl = inputs.url; //"https://www.medicalnewstoday.com/articles/friendly-e-coli-may-protect-the-gut-from-their-deadly-cousin";
    const { body } = await got(_targetUrl);
    let resObj = {};
    console.log("request in-progress");
    if (body) {
      (resObj = {}),
        //set a reference to the document that came back
        ($ = cheerio.load(body)),
        //create a reference to the meta elements
        ($title = $("head title").text()),
        ($desc = $('meta[name="description"]').attr("content")),
        ($kwd = $('meta[name="keywords"]').attr("content")),
        ($ogTitle = $('meta[property="og:title"]').attr("content")),
        ($ogImage = $('meta[property="og:image"]').attr("content")),
        ($ogkeywords = $('meta[property="og:keywords"]').attr("content")),
        ($images = $("img"));

      if ($title) {
        resObj.title = $title;
      }

      if ($desc) {
        resObj.description = $desc;
      }

      if ($kwd) {
        resObj.keywords = $kwd;
      }

      if ($ogImage && $ogImage.length) {
        resObj.mainImage = $ogImage;
      }

      if ($ogTitle && $ogTitle.length) {
        resObj.mainTitle = $ogTitle;
      }

      if ($ogkeywords && $ogkeywords.length) {
        resObj.mainKeywords = $ogkeywords;
      }

      if ($images && $images.length) {
        resObj.images = [];

        for (var i = 0; i < $images.length; i++) {
          resObj.images.push($($images[i]).attr("src"));
        }
      }

      //send the response
      // res.end(JSON.stringify(resObj));
      console.log("request complete");
      return exits.success(resObj);
    } else {
      console.log("request complete");
      return exits.success(false);
    }
  },
};
