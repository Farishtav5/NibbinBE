var moment = require('moment');
const moment_timezone = require('moment-timezone');

module.exports.cron = {
    myFirstJob: {
      schedule: '0 */15 * * * *', //['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek']
      // '0 */1 * * * *'
    //   onTick: function () {
    //     console.log('You will see this every second');
    //     console.log(`Also, sails object is available as this, e.g. ${this.config.environment}`);
    //   },
      onTick: async function() {
        // console.log('I am triggering when time is come');
        let now = Math.floor(new Date().getTime() / 1000);
        // console.log(now);
        let date = moment().format("YYYY-MM-DD HH:mm:ss");
        let currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
        let last15minutesTime = moment().subtract(15, 'minutes').format("YYYY-MM-DD HH:mm:ss");

        console.log('currentTime', currentTime);
        let floridaTime = moment_timezone().tz("America/New_York").format("YYYY-MM-DD HH:mm:ss");
        console.log('Florida CurrentTime', floridaTime);
        let floridaTimeHour = moment_timezone().tz("America/New_York").hour();
        if(floridaTimeHour >= 8 && floridaTimeHour <= 22){
          let autoSchedule_newsObj = await News.find({ status: "auto-scheduled" }).sort('updatedAt ASC');
          autoSchedule_newsObj = autoSchedule_newsObj[0];
          if(autoSchedule_newsObj){
            await publish_AutoScheduleNews(autoSchedule_newsObj);
          }
        }

        let newsObj = await News.find({ status: "scheduled", scheduledTo: { '<=': floridaTime } });
        console.log('newsObj', newsObj);
        if(newsObj.length){
          await runAsyncPublishPost(newsObj);
        }
      },
      onComplete: function() {
        // console.log('I am triggering when job is complete');
      },
      start: true, // Start task immediately
      context: undefined, // Custom context for onTick callback
      runOnInit: true
    }
  };

const runAsyncPublishPost = async (newsList) => {
  if(newsList.length){
    Promise.all(
      newsList.map(async (news) => {
        let result = await News.update({ id: news.id }).set({
          // publishedAt: new Date()
          publishedAt: moment_timezone().tz("America/New_York").format("YYYY-MM-DD HH:mm:ss"),
          dated: news.scheduledTo,
          status: 'published'
        }).fetch();
        console.log('scheduled to published : ', result.length);
        if(result.length && result[0]){
            let updatedNews = result[0];
            let findUpdatedNews = null;
            if(sails.config.environment === 'production') {
              findUpdatedNews = await News.findOne({ id: updatedNews.id }).populate("categories");
              if(findUpdatedNews && findUpdatedNews.imageId){
                let findImageById = await Images.findOne({ id: findUpdatedNews.imageId });
                if(findImageById){
                    let _image_id = _.cloneDeep(findImageById);
                    findUpdatedNews.imageSrc = _image_id.imageSrc;
                    findUpdatedNews.imageSourceName = _image_id.imageSourceName;
                    findUpdatedNews.imageId = _image_id.id;
                }
              }

              if(updatedNews.status === "published" && updatedNews.send_notification && findUpdatedNews.id) {
                  let firebaseDb = sails.config.firebaseDb();
                  let data = {
                      postValue: findUpdatedNews.id,
                      title: findUpdatedNews.headline,
                      type: findUpdatedNews.type
                  }
                  if (findUpdatedNews.imageSrc) {
                      data.imageSrc = findUpdatedNews.imageSrc
                  }
                  if (findUpdatedNews.categories) {
                      let _categories = Array.prototype.map.call(findUpdatedNews.categories, function(item) { return item.id; });//.join(","); // "A,B,C"
                      data.categories = _categories
                  }
                  let createdData = await firebaseDb.collection('posts').add(data);
                  console.log('firebase notification - news published Via CRON');
              }
              if(updatedNews.status === "published" && findUpdatedNews.tweet === true && findUpdatedNews.id && updatedNews.type === 'news') {
                let _tweetResult = await sails.helpers.twitterIntegration.with({
                    newsId: findUpdatedNews.id,
                    imgSrc: findUpdatedNews.imageSrc,
                    headline: findUpdatedNews.headline
                });
                console.log('tweet by schedule publish', _tweetResult);
              }
            }
        }

      })
    )
  }
  console.log(newsList.length);
}

const publish_AutoScheduleNews = async (news) =>{
  let result = await News.update({ id: news.id }).set({
    // publishedAt: new Date()
    publishedAt: moment_timezone().tz("America/New_York").format("YYYY-MM-DD HH:mm:ss"), //news.dated ? news.dated : moment().format("YYYY-MM-DD hh:mm:ss"),
    status: 'published'
  }).fetch();
  console.log('auto scheduled to published : ', result.length);
  if(result.length && result[0]){
      let updatedNews = result[0];
      let findUpdatedNews = null;
      if(sails.config.environment === 'production') {
        findUpdatedNews = await News.findOne({ id: updatedNews.id }).populate("categories");
        if(findUpdatedNews && findUpdatedNews.imageId){
          let findImageById = await Images.findOne({ id: findUpdatedNews.imageId });
          if(findImageById){
              let _image_id = _.cloneDeep(findImageById);
              findUpdatedNews.imageSrc = _image_id.imageSrc;
              findUpdatedNews.imageSourceName = _image_id.imageSourceName;
              findUpdatedNews.imageId = _image_id.id;
          }
        }
        if(updatedNews.status === "published" && updatedNews.send_notification && findUpdatedNews) {
            let firebaseDb = sails.config.firebaseDb();
            let data = {
                postValue: findUpdatedNews.id,
                title: findUpdatedNews.headline,
                type: findUpdatedNews.type
            }
            if (findUpdatedNews.imageSrc) {
                data.imageSrc = findUpdatedNews.imageSrc
            }
            if (findUpdatedNews.categories) {
                let _categories = Array.prototype.map.call(findUpdatedNews.categories, function(item) { return item.id; });//.join(","); // "A,B,C"
                data.categories = _categories
            }
            let createdData = await firebaseDb.collection('posts').add(data);
            console.log('firebase notification - news published Via CRON Auto Schedule');
        }
        if(updatedNews.status === "published" && findUpdatedNews.tweet === true && findUpdatedNews.id && updatedNews.type === 'news') {
          let _tweetResult = await sails.helpers.twitterIntegration.with({
              newsId: findUpdatedNews.id,
              imgSrc: findUpdatedNews.imageSrc,
              headline: findUpdatedNews.headline
          });
          console.log('tweet by Auto Schedule publish', _tweetResult);
        }
      }
  }
}