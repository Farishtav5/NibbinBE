// const Twitter = require('twitter');
const Twitter = require('twitter-lite');
const fs = require("fs");
const got = require("got");

// const client = new Twitter({
//   consumer_key: 'jxeDn0iPFiDM8YRGL4yIKH0r3',
//   consumer_secret: 'kt5IT4V6QwGDpYfRKIdwDsLhcD1FIIHx9VcYXjSn5WJrqreyw1',
//   // access_token_key: '1318535675742883841-VTvbIAWqxgFhX5uqxdeYohFzyyyuFL',
//   // access_token_secret: 'dqoq5Wuf7J7s4FntMwnlb1IysrNhtnil2wyfm0nMdoXdW',
//   // bearer_token: 'AAAAAAAAAAAAAAAAAAAAACtsJgEAAAAAgLz4QPBq9edCKm6nKGXUpJNFsEU%3DKMFpQxLTEz00PvepgPky4fX18K6xYwqwnND1md2CdSWnwH3smQ'
// });

// const response = await client.getBearerToken();
// const app = new Twitter({
//   bearer_token: response.access_token
// });

module.exports = {


  friendlyName: 'Twitter integration',


  description: '',


  inputs: {
    newsId: {
      type: "number",
      example: 1,
      description: "The Id of News",
      required: true,
    },
    imgSrc: {
      type: "string",
      example: "in-queue",
      description: "The status of news",
    },
    headline: {
      type: "string",
      example: "News approved",
      description: "The type of activity like news",
    },

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    // TODO

    const client = new Twitter({
      consumer_key: 'jxeDn0iPFiDM8YRGL4yIKH0r3',
      consumer_secret: 'kt5IT4V6QwGDpYfRKIdwDsLhcD1FIIHx9VcYXjSn5WJrqreyw1',
      access_token_key: '1318535675742883841-LAB8XK6YPKZeQBnA5jCkLpoTwO8gqw',
      access_token_secret: 'DwuOWqmf6V2nQ8hqMd9jxClqqkEc26hI9hDIxRkkcg9jk',
      // bearer_token: 'AAAAAAAAAAAAAAAAAAAAACtsJgEAAAAAgLz4QPBq9edCKm6nKGXUpJNFsEU%3DKMFpQxLTEz00PvepgPky4fX18K6xYwqwnND1md2CdSWnwH3smQ'
    });

    const twUploadClient = new Twitter({
      subdomain: 'upload',
      consumer_key: 'jxeDn0iPFiDM8YRGL4yIKH0r3',
      consumer_secret: 'kt5IT4V6QwGDpYfRKIdwDsLhcD1FIIHx9VcYXjSn5WJrqreyw1',
      access_token_key: '1318535675742883841-LAB8XK6YPKZeQBnA5jCkLpoTwO8gqw',
      access_token_secret: 'DwuOWqmf6V2nQ8hqMd9jxClqqkEc26hI9hDIxRkkcg9jk',
    });

    let _image = await getImage(inputs.imgSrc, inputs.newsId);
    if(_image){
      console.log('_image', _image);

      twUploadClient.post('media/upload', {
        media_data: Buffer.from(_image).toString('base64')
      }).then((media) => {
        if (media) {
          // If successful, a media object will be returned.
          console.log('media uploaded on twitter : ', media.media_id_string);

          // media_id: 1326907637729005600,
          // media_id_string: '1326907637729005570',

          if(media.media_id && media.media_id_string){
            let statusObj = {
              status: inputs.headline + "\r\n" + createSlug({id: inputs.newsId, headline: inputs.headline}) + "\r\n \r\n" + addHashtags(),
              media_ids: media.media_id_string
            }
            // Lets tweet it
            client.post('statuses/update', statusObj).then((response)=>{
              console.log('response : ', response.text);  // Raw response object.
              return exits.success(true);
            })
            .catch((err) => {
              console.log('twitter post error : ', err);
              return exits.success(false);
            });
          }
      
        }
      })
      .catch((err) => {
        console.log('twitter media upload error : ', err);
        return exits.success(false);
      });
    }else{
      return exits.success(false);
    }

    // client.post('statuses/update', statusObj,  function(error, tweet, response) {
    //   if(error) {
    //     console.log('error twitter: ', error);
    //     return exits.success(false);
    //   };
    //   console.log(tweet);  // Tweet body.
    //   console.log(response);  // Raw response object.
    //   return exits.success(true);
    // });
  }


};

function addHashtags(){
  return "#Nibbin #CovidTimes #HealthCareNews #Awareness #Healthcare #News"
}

function createSlug(newsValue){
  if(newsValue && newsValue.id && newsValue.headline){
    return "Read Now: https://nibb.in/news?id=" + Base64.encode((newsValue.id).toString());
    // return "https://nibb.in/news/?id=" + newsValue.id + "-" + string_to_slug(newsValue.headline);
  }else{
    return "#";
  }
}
function string_to_slug(str) {
  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();
  // remove accents, swap ñ for n, etc
  var from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }
  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
  return str;
}

async function getImage(imagepath, newsId) {
  const fileName = "assets/images/"+ newsId +".jpg";
  return new Promise(resolve => {
      const downloadStream = got.stream(imagepath);
      const fileWriterStream = fs.createWriteStream(fileName);
      const bufs = [];
      downloadStream
      .on("downloadProgress", ({ transferred, total, percent }) => {
          const percentage = Math.round(percent * 100);
          console.error(`twitter progress: ${transferred}/${total} (${percentage}%)`);
      })
      // .on('data', function (chunk) {
      //     bufs.push(chunk)
      // })
      // .on('end', function () {
      //     // We can join all of the 'chunks' of the image together
      //     const data = Buffer.concat(bufs);
      //     // Then we can call our callback.
      //     resolve(data);
      // })
      .on("error", (error) => {
          console.error(`Twitter Download failed: ${error.message}`);
          // return false;
          resolve(false);
      });

      fileWriterStream
        .on("error", (error) => {
            console.error(`Twiiter Could not write file to system: ${error.message}`);
            resolve(false);
        })
        .on("finish", () => {
            console.log(`Twitter File downloaded to ${fileName}`);
            const fileContent = fs.readFileSync(fileName);
            // return true;
            fs.unlinkSync(fileName);
            resolve(fileContent);
        });

        downloadStream.pipe(fileWriterStream);
  })
}

let Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

