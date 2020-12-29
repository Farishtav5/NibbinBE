/**
 * ImageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fs = require("fs");
const got = require("got");
const moment = require('moment');
const moment_timezone = require('moment-timezone');
const keyword_extractor = require("keyword-extractor");

activities = Utilities.activities;
UUID = Utilities.uuid;

module.exports = {
  uploadFile: async function (req, res) {
    let params = req.allParams();
    const options = {
      // This is the usual stuff
      adapter: require("skipper-better-s3"),
      key: 'AKIA22F3ZX7YBVHPG3LW',
      secret: '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',
      bucket: 'cdn-nibbin',
    //   region: "us-east-1", // Optional - default is 'us-standard'
      // Let's use the custom s3params to upload this file as publicly
      // readable by anyone
      // dirname: 'images',
      dirname: ((sails.config.environment === 'qa' || sails.config.environment === 'development') ? 'dev_images' : 'images'),
      s3params: { ACL: "public-read" },
      // And while we are at it, let's monitor the progress of this upload
      onProgress: (progress) => sails.log.verbose("Upload progress:", progress),
    };

    req.file("image").upload(options, async (err, files) => {
      // ... Continue as usual
      if (err) return res.serverError(err);

      let uploadedUrl = files[0].extra.Location;
      let _imageData = {
        imageSrc: uploadedUrl.replace(/^.+amazonaws.com/,'https://cdn.nibb.in')
      }
      if(params.imageSourceName) _imageData.imageSourceName = params.imageSourceName;
      if(params.tags) _imageData.tags = params.tags;
      _imageData.type = params.type ? params.type : 'news';
      let createdImagesObj = await Images.create(_imageData).fetch();

      // if(createdImagesObj){
      //   await Images.addToCollection(createdImagesObj.id, 'categories').members([_categories]);
      //   // now update in news
      //   let UpdatedNews = await News.update({ id: newsId }).set({ imageId: createdImagesObj.id }).fetch();
      // }
      if(params.type === 'graphics') await addAndUpdateGraphics(params,req, res, createdImagesObj);
      else return res.send({imageId: createdImagesObj.id, link: uploadedUrl, imageSourceName:createdImagesObj.imageSourceName});
    }, this);
  },
  updateImageInGallery: async function (req, res) {
    let params = req.allParams();    
    const options = {
      // This is the usual stuff
      adapter: require("skipper-better-s3"),
      key: 'AKIA22F3ZX7YBVHPG3LW',
      secret: '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',
      bucket: 'cdn-nibbin',
    //   region: "us-east-1", // Optional - default is 'us-standard'
      // Let's use the custom s3params to upload this file as publicly
      // readable by anyone
      // dirname: 'images',
      dirname: ((sails.config.environment === 'qa' || sails.config.environment === 'development') ? 'dev_images' : 'images'),
      s3params: { ACL: "public-read" },
      // And while we are at it, let's monitor the progress of this upload
      onProgress: (progress) => sails.log.verbose("Upload progress:", progress),
    };

    let findfImage = await Images.findOne({id: params.id});
    if(findfImage){
      req.file("image").upload(options, async (err, files) => {
        if (err) return res.serverError(err);
  
        let uploadedUrl = files[0].extra.Location;
        let _imageData = {
          imageSrc: uploadedUrl.replace(/^.+amazonaws.com/,'https://cdn.nibb.in')
        }
        if(params.imageSourceName) _imageData.imageSourceName = params.imageSourceName;
        if(params.tags) _imageData.tags = params.tags;
  
        let updateImageObj = await Images.updateOne({id: findfImage.id}).set(_imageData);
        return res.send({imageId: updateImageObj.id, link: uploadedUrl, imageSourceName:updateImageObj.imageSourceName});
      }, this);
    }else{
      return ResponseService.json(400, res, "image not found");
    }

  },
  /** 
   * TODO: Upload in Images or Gallery
  */

 getAllImagesForGallery: async function (req, res) {
  let params = req.allParams();
  params.type = params.type ? params.type : 'news'
  let whereQueryTags = {original: false, or: [{ type: JSON.stringify(params.type)}, {type: null}]};
  if(params.tags){
    whereQueryTags.or = []
    let tempTags = (params.tags).toString().split(",");
    for (let i = 0; i < tempTags.length; i++) {
      const item = tempTags[i];
      whereQueryTags.or.push({ tags: {contains: item }})
    }
    // query.tags = { contains: params.tags }
  }
  let allImages = await Images.find().sort('id DESC').where(whereQueryTags);
  console.log('allImages : ', allImages.length);
  return ResponseService.json(200, res, "getting all images", allImages);
 },

  // uploadFile_OLD: function (req, res) {
  //   // req.file('image').upload({
  //   //   adapter: require('skipper-s3'),
  //   //   key: 'AKIA22F3ZX7YBVHPG3LW',
  //   //   secret: '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',
  //   //   bucket: 'cdn-nibbin',
  //   //   dirname: 'images',
  //   //   headers: {
  //   //     ContentType: 'image/png',
  //   //     ACL: 'public-read'
  //   //   }
  //   // }, function (err, filesUploaded) {
  //   //   if (err) return res.serverError(err);
  //   //   return res.ok({
  //   //     // files: filesUploaded,
  //   //     link: "https://cdn-nibbin.s3.us-east-2.amazonaws.com/" + filesUploaded[0].fd,
  //   //     textParams: req.allParams()
  //   //   });
  //   // });

  //   const options = {
  //     // This is the usual stuff
  //     adapter: require("skipper-better-s3"),
  //     key: 'AKIA22F3ZX7YBVHPG3LW',
  //     secret: '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',
  //     bucket: 'cdn-nibbin',
  //   //   region: "us-east-1", // Optional - default is 'us-standard'
  //     // Let's use the custom s3params to upload this file as publicly
  //     // readable by anyone
  //     dirname: 'images',
  //     s3params: { ACL: "public-read" },
  //     // And while we are at it, let's monitor the progress of this upload
  //     onProgress: (progress) => sails.log.verbose("Upload progress:", progress),
  //   };

  //   req.file("image").upload(options, (err, files) => {
  //     // ... Continue as usual
  //     if (err) return res.serverError(err);
  //     return res.ok({
  //       files: files,
  //       link: files[0].extra.Location,
  //       // link: "https://cdn-nibbin.s3.us-east-2.amazonaws.com/" + filesUploaded[0].fd,
  //       textParams: req.allParams(),
  //     });
  //   });
  // },

  /** 
   * TODO: Below Actions are only for developers to uplaod excels of news and images
   * We Will remove them after second release.
  */
  showExcelPage: async function (req, res){
    let params = req.allParams();
    if(params.type === 'images'){
      return res.view('pages/image_excelupload');
    }else{
      return res.view('pages/excelupload');
    }
  },
  uploadExcel: async function (req, res) {
    let params = req.allParams();
    if(params.news && params.news.length){
        let NewsArray = params.news;
        let cloneObj = _.cloneDeep(NewsArray);
        console.log('NewsArray length', NewsArray.length);
        let insertedData = [];
        for (let i = 0; i < NewsArray.length; i++) {
          const t = NewsArray[i];
          // let metaInfoFromSource = await sails.helpers.scrapImageFromUrl.with({
          //     url: t.link,
          // });
          
          let news_data = {
            title: t.title,
            headline: t.headline,
            imageSrc: t.imageSrc,
            imageSourceName: t.imageSourceName,
            shortDesc: t.shortDesc,
            link: t.link,
            dated: t.dated,
            categories_ids: t.categories_ids,
            excel_id: t.excel_id,
            createdBy: 2,
            updatedBy: 2
          }
          // if(metaInfoFromSource) news_data.metaSource = metaInfoFromSource;

          // let _imageId = await automateImageForNews_UpdateNews(news_data);

          // if(_imageId) {
          //   news_data.imageId = _imageId;
          // }
          if(news_data.shortDesc && news_data.imageId){
            news_data.status = activities.NEWS.STATUS.PUBLISHED;
          }else if(news_data.shortDesc && !news_data.imageId){
            news_data.status = activities.NEWS.STATUS.IN_DESIGN;
          }else if(!news_data.shortDesc){
            news_data.status = activities.NEWS.STATUS.IN_CONTENT;
          }
          let insertedNews = await News.create(news_data).fetch();
          if (cloneObj[i].categories_ids.length) {
              await News.addToCollection(insertedNews.id, 'categories', cloneObj[i].categories_ids);
          }
          if(insertedNews) insertedData.push(insertedNews);
        }
        return ResponseService.json(200, res, "get report successfully", insertedData);
    }
    if(params.images && params.images.length){
        let ImagesArray = params.images;
        let cloneObj = _.cloneDeep(ImagesArray);
        console.log('ImagesArray length', ImagesArray.length);
        let insertedData = await Images.createEach(ImagesArray).fetch();
        if (insertedData.length) {
            console.log('insertedData', insertedData.length);
            let result = await Images.find().populate("categories");
            return ResponseService.json(200, res, "get report successfully", result);
        }
    }
  },

  scrapImageUrl: async function (req, res) {
    let news = await News.find(); // {metaSource: null}
    console.log('news.length', news.length);
    if(news.length){
      for (let i = 0; i < news.length; i++) {
        let t = news[i];
        console.log('news_id : ', t.id);
        // if(t.id > 1065 && t.id !== 1087 && t.id !== 1694){
        //   let metaInfoFromSource = await sails.helpers.scrapImageFromUrl.with({ url: t.link });
        //   console.log('i = ' + i + ', metaInfoFromSource = ' + metaInfoFromSource + ', new id = '+ t.id);
        //   if(metaInfoFromSource){
        //     let result = await News.update({
        //         id: t.id
        //     }).set({metaSource: metaInfoFromSource}).fetch();
        //   }
        // }

        // let _imageId = await automateImageForNews_UpdateNews(t);
        // if(_imageId){
        //   let result = await News.update({
        //       id: t.id
        //   }).set({imageId: _imageId}).fetch();
        //   console.log('i = ' + i + ', imageId = ' + _imageId + ', new id = '+ t.id);
        // }
        
        // let status;

        // if(t.shortDesc && t.imageId){
        //   status = activities.NEWS.STATUS.PUBLISHED;
        // }else if(t.shortDesc && !t.imageId){
        //   status = activities.NEWS.STATUS.IN_DESIGN;
        // }else if(!t.shortDesc){
        //   status = activities.NEWS.STATUS.IN_CONTENT;
        // }
        // let result = await News.update({
        //     id: t.id
        // }).set({status: status}).fetch();
        console.log('i = ' + i + ', status = ' + status + ', news_id = '+ t.id);


      }
    }
    res.send({l: news.length});
  },
};

async function addAndUpdateGraphics(params, req, res, createdImagesObj) {
  let actions = {
    share: params.share === 'true' ? true : false, 
    report: params.report === 'true' ? true : false
  }
  let _catObj = {}
  params.categories = JSON.parse(params.categories)
  if (params.categories) {
    _catObj.categories_ids = params.categories.join(',');
    let _catarr = await Category.find({id: params.categories });
    _catObj.categories_array = _catarr;
  }
  let newsObj = {
    status: params.status,
    type: params.type,
    send_notification: params.send_notification === "true" ? true : false,
    tweet: params.tweet === "true" ? true : false,
    headline: params.headline,
    actions: actions,
    dated: new Date(),
    createdBy: req.currentUser.id,
    updatedBy: req.currentUser.id,
    imageId: createdImagesObj.id,
    categories_ids: (_catObj.categories_ids) ? _catObj.categories_ids : '',
    categories_array: (_catObj.categories_array) ? _catObj.categories_array : []
  }
  let _date = new Date(params.dated);
  if(params.status === 'published') {
    newsObj.publishedAt = moment_timezone().tz("America/New_York").format("YYYY-MM-DD HH:mm:ss");
    newsObj.dated = _date ? moment(_date).format("YYYY-MM-DD HH:mm:ss") : moment().format("YYYY-MM-DD HH:mm:ss");
  } 
  if(params.status === "scheduled") newsObj.scheduledTo = moment(_date).format("YYYY-MM-DD HH:mm:ss")

  let result
  if(params.id) result = await News.updateOne({id: params.id}).set(newsObj);
  else result = await News.create(newsObj).fetch();

  if(result) {
    if(sails.config.environment != 'development') await sendNotificationAndTweets(result)
    if(params.id) return ResponseService.json(200, res, "graphics updated", result);
    else return ResponseService.json(200, res, "graphics created", result);
  }
  else return ResponseService.json(400, res, "error while creating graphics");
}

async function downloadImageFromSource_and_UploadOnS3(imagepath) {
  let url = imagepath;
  console.log('downloadImageFromSource : ', url);
  let imageNumber = UUID() + '.png';
  let imageName = "assets/images/" + imageNumber;
  
  const fileName = imageName;
  // const downloadStream = got.stream(url);
  // const fileWriterStream = fs.createWriteStream(fileName);

  return new Promise(resolve => {
    try {
      const downloadStream = got.stream(url);
      const fileWriterStream = fs.createWriteStream(fileName);
      downloadStream
      .on("downloadProgress", ({ transferred, total, percent }) => {
          const percentage = Math.round(percent * 100);
          // console.error(`progress: ${transferred}/${total} (${percentage}%)`);
      })
      .on("error", (error) => {
          console.error(`Download failed: ${error.message}`);
          // return false;
          resolve(false);
      });

      fileWriterStream
      .on("error", (error) => {
          console.error(`Could not write file to system: ${error.message}`);
          resolve(false);
      })
      .on("finish", () => {
          console.log(`File downloaded to ${fileName}`);
          const AWS = require('aws-sdk');
          const s3 = new AWS.S3({
              accessKeyId: 'AKIA22F3ZX7YBVHPG3LW',
              secretAccessKey: '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'
          });
          const fileContent = fs.readFileSync(fileName);

          let dirname = ((sails.config.environment === 'qa' || sails.config.environment === 'development') ? 'dev_source_download' : 'images');

          // setting up s3 upload parameters
          const params = {
              Bucket: 'cdn-nibbin',
              Key: dirname + '/' + imageNumber, // file name you want to save as
              Body: fileContent,
              ACL: "public-read",
              ContentType: "image/png" //"image/png"
          };

          // Uploading files to the bucket
          s3.upload(params, (err, data) => {
              if (err) {
                  throw err;
              }
              console.log(`File uploaded successfully. ${data.Location}`);
              // fs.unlinkSync(fileName);
              // return data.Location;
              resolve(data.Location);
          });
          // return true;
      });

      downloadStream.pipe(fileWriterStream); 
    } catch (error) {
      console.log('error during download image from source', error);
      resolve(false);
    }
  })
}

async function searchImageFromGalleryByTags(news) {
  //
  let AllGaleryImages = await Images.find();
  let matchedArrayWithImages = [];

  // let _newsTitle_WordsArray = string_to_array(removeSymbol(news.headline));
  // let _newsShortDesc_WordsArray = string_to_array(removeSymbol(news.shortDesc));
  let _newsTitle_WordsArray = find_key_words(news.headline);
  let _shortDesc = contentExtractor(news.shortDesc);
  let _newsShortDesc_WordsArray = find_key_words(_shortDesc);
  for (let i = 0; i < AllGaleryImages.length; i++) {
      const item = AllGaleryImages[i];
      if(item.tags){
          let _tags = item.tags.toLowerCase().trim().split(",").map(Function.prototype.call, String.prototype.trim);
          // console.log('_tags', _tags);
          let matchValuesArray = _newsTitle_WordsArray.filter(element => _tags.includes(element));
          if(matchValuesArray.length === 0){
              matchValuesArray = _newsShortDesc_WordsArray.filter(element => _tags.includes(element));
          }
          matchedArrayWithImages.push(
              {
                  imageId: item.id, 
                  imageSrc: item.imageSrc, 
                  matched: matchValuesArray, 
                  count: matchValuesArray.length
              }
          );
      }
  }
  matchedArrayWithImages = matchedArrayWithImages.filter((item) => item.count!==0);
  let maxItem = Math.max.apply(Math, matchedArrayWithImages.map(function(o) { return o.count; }));
  var _Indexed = {};
  var itemsArray = [];

  matchedArrayWithImages.forEach(function(item) {
      item.matched.forEach(function(value) {
          // create a new category if it does not exist yet
          if(!_Indexed[value]) {
              _Indexed[value] = {
                  matched: [],
                  total: 0
              };
              itemsArray.push(_Indexed[value]);
          }

          // add the product to the category
          _Indexed[value].matched.push({
              imageId: item.imageId, 
              imageSrc: item.imageSrc, 
              matched: item.matched, 
              count: item.count  
          });
          _Indexed[value].total = _Indexed[value].matched.length;
      });
  });
  let xMax = Math.max(...Array.from(itemsArray, o => o.total));
  let maxXObject = itemsArray.find(o => o.total === xMax);
  maxXObject = (maxXObject && maxXObject.matched) ? maxXObject.matched : [];
  let result = (maxXObject.length > 0) ? maxXObject[Math.floor(Math.random() * maxXObject.length)] : null;
  console.log('search Image by tags', result);
  return result;
}

async function automateImageForNews_UpdateNews(news) {
  if(news && news.metaSource && news.metaSource.mainImage){
    if(validURL(news.metaSource.mainImage)){
      let uploadImageOnS3 = await downloadImageFromSource_and_UploadOnS3(news.metaSource.mainImage);
      console.log('uploadImageOnS3', uploadImageOnS3);
      if(uploadImageOnS3){
        let sourceName = extractHostname(news.link); //url.parse(news.link).hostname;
        // res.send({uploadImageOnS3, sourceName});
        let _imageData = {
            imageSrc: uploadImageOnS3.replace(/^.+amazonaws.com/,'https://cdn.nibb.in'),
            imageSourceName: sourceName,
            original: true
          }
          let createdImagesObj = await Images.create(_imageData).fetch();
        //   res.send({uploadImageOnS3, sourceName, createdImagesObj});
        if(createdImagesObj && createdImagesObj.id){
            return createdImagesObj.id;
        }else{
            return null;
        }
      }else{
        return null;
      }
    }else{
      return null;
    }
  }else{
      let imgObj = await searchImageFromGalleryByTags(news);
      if(imgObj){
          return imgObj.imageId;
      }else{
          return null;
      }
  }
}


function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("//") > -1) {
      hostname = url.split('/')[2];
  }
  else {
      hostname = url.split('/')[0];
  }
  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];
  return hostname;
}

function find_key_words(sentence) {
  return keyword_extractor.extract(sentence,{
      language:"english",
      remove_digits: true,
      return_changed_case:true,
      remove_duplicates: false

 });
}

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
};

//will remove later
function contentExtractor(shortDesc) {
  if(shortDesc) {
      let str = shortDesc.replace(/<[p]+>|<[li]+>/g, "\n");
      return str.replace(/<[^>]+>/g, '').trim();
  } else return ""
  
};

async function sendNotificationAndTweets(news) {
  if(news.status === "published") {
    let result = await News.findOne({ id: news.id }).populate("categories").populate("imageId");
    let _image = result.imageId
    if(result.send_notification) {
      let firebaseDb = sails.config.firebaseDb();
      let data = {
        postValue: result.id,
        title: result.headline,
        type: result.type
      }
      if (_image.imageSrc) {
        data.imageSrc = _image.imageSrc
      }
      if (result.categories_array) {
          let _categories = Array.prototype.map.call(result.categories_array, function(item) { return item.id; });//.join(","); // "A,B,C"
          data.categories = _categories
      }
      let createdData = await firebaseDb.collection('posts').add(data);
      console.log('firebase notification - news published', createdData);
    }
    if(result.tweet) {
      let _tweetResult = await sails.helpers.twitterIntegration.with({
          newsId: result.id,
          imgSrc: _image.imageSrc,
          headline: result.headline,
          categories: result.categories_array,
      });
      console.log('tweet by manual publish', _tweetResult);
    }
  }
  
  
};