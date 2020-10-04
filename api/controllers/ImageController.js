/**
 * ImageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  uploadFile: function (req, res) {
    // req.file('image').upload({
    //   adapter: require('skipper-s3'),
    //   key: 'AKIA22F3ZX7YBVHPG3LW',
    //   secret: '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',
    //   bucket: 'cdn-nibbin',
    //   dirname: 'images',
    //   headers: {
    //     ContentType: 'image/png',
    //     ACL: 'public-read'
    //   }
    // }, function (err, filesUploaded) {
    //   if (err) return res.serverError(err);
    //   return res.ok({
    //     // files: filesUploaded,
    //     link: "https://cdn-nibbin.s3.us-east-2.amazonaws.com/" + filesUploaded[0].fd,
    //     textParams: req.allParams()
    //   });
    // });

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

    req.file("image").upload(options, (err, files) => {
      // ... Continue as usual
      if (err) return res.serverError(err);
      return res.ok({
        files: files,
        link: files[0].extra.Location,
        // link: "https://cdn-nibbin.s3.us-east-2.amazonaws.com/" + filesUploaded[0].fd,
        textParams: req.allParams(),
      });
    });
  },
};
