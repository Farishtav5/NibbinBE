/**
 * ImageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  uploadFile: async function (req, res) {
    let params = req.allParams();
    let newsId = params.newsId;
    let findNews = await News.findOne({ id: newsId });
    if(!findNews){
      return ResponseService.json(404, res, "news not found");
    }
    
    const options = {
      // This is the usual stuff
      adapter: require("skipper-better-s3"),
      key: 'AKIA22F3ZX7YBVHPG3LW',
      secret: '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',
      bucket: 'cdn-nibbin',
    //   region: "us-east-1", // Optional - default is 'us-standard'
      // Let's use the custom s3params to upload this file as publicly
      // readable by anyone
      dirname: 'images',
      s3params: { ACL: "public-read" },
      // And while we are at it, let's monitor the progress of this upload
      onProgress: (progress) => sails.log.verbose("Upload progress:", progress),
    };

    req.file("image").upload(options, async (err, files) => {
      // ... Continue as usual
      if (err) return res.serverError(err);

      let uploadedUrl = files[0].extra.Location;
      let _imageData = {
        imageSrc: uploadedUrl
      }
      if(params.imageSourceName) _imageData.imageSourceName = params.imageSourceName;
      if(params.tags) _imageData.tags = params.tags;

      if(findNews.imageId){
        let findImageById = await Images.findOne({ id: findNews.imageId });
        let _categories = null;
        if (findNews.categories) {
          _categories = Array.prototype.map.call(findNews.categories, function(item) { return item.id; }).join(","); // "A,B,C"
        }
        if(findImageById){ 
          //id found in images and news, now we have to update in images
          let updatedImagesTable = await Images.update({id: findNews.imageId }).set(_imageData).fetch();
          if(_categories){
            let resultCategories = await Images.replaceCollection(findNews.imageId, 'categories').members([_categories]);
          }
        }
        else{
          // not found in images but found in news
          // now we have to create a record in images by ref of news-images-id
          
          let createdImagesObj = await Images.create(_imageData).fetch();
          if(createdImagesObj){
            await Images.addToCollection(createdImagesObj.id, 'categories').members([_categories]);
          }
        }
      }
      else{
        //not found in news by ref id of Images
        // we have to create a record in Imags and then will update in news
        let createdImagesObj = await Images.create(_imageData).fetch();
        if(createdImagesObj){
          await Images.addToCollection(createdImagesObj.id, 'categories').members([_categories]);
          // now update in news
          let UpdatedNews = await News.update({ id: newsId }).set({ imageId: createdImagesObj.id }).fetch();
        }
      }
      let findUpdatedNewsObj = await News.findOne({ id: newsId });
      return res.send(findUpdatedNewsObj);
    });
  },
  /** 
   * TODO: Upload in Images or Gallery
  */

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
        // await News.destroy({});
        let NewsArray = params.news;
        let cloneObj = _.cloneDeep(NewsArray);
        console.log('NewsArray length', NewsArray.length);
        let insertedData = await News.createEach(NewsArray).fetch();
        if (insertedData.length) {
            console.log('insertedData', insertedData.length);
            for (let index = 0; index < insertedData.length; index++) {
                const news = insertedData[index];
                if (cloneObj[index].categories_ids.length) {
                    await News.addToCollection(news.id, 'categories', cloneObj[index].categories_ids);
                }
            }
            let result = await News.find().populate("categories");
            return ResponseService.json(200, res, "get report successfully", result);
        }
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

    // res.send({
    //     news: params.news,
    //     newsIds: params.newsIds
    // });
  }
};
