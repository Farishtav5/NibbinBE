var moment = require('moment');

module.exports.cron = {
    myFirstJob: {
      schedule: '* */15 * * * *', //['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek']
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

        let timeCondition = { 
          // '>=' : last15minutesTime,
          '<=' : currentTime
        }

        let newsObj = await News.findOne({ status: "scheduled", scheduledTo: timeCondition });
        if(newsObj){
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
          publishedAt: news.scheduledTo,
          status: 'published'
        }).fetch();
        console.log('scheduled to published : ', result.length);
        if(result.length && result[0]){
            let updatedNews = result[0];
            if(updatedNews.status === "published"){
                let findUpdatedNews = await News.findOne({ id: updatedNews.id }).populate("categories");
                if(findUpdatedNews && findUpdatedNews.imageId){
                  let findImageById = await Images.findOne({ id: findUpdatedNews.imageId });
                  if(findImageById){
                      let _image_id = _.cloneDeep(findImageById);
                      findUpdatedNews.imageSrc = _image_id.imageSrc;
                      findUpdatedNews.imageSourceName = _image_id.imageSourceName;
                      findUpdatedNews.imageId = _image_id.id;
                  }
                }
                let firebaseDb = sails.config.firebaseDb();
                let data = {
                    postValue: findUpdatedNews.id,
                    title: findUpdatedNews.headline
                }
                if (findUpdatedNews.imageSrc) {
                    data.imageSrc = findUpdatedNews.imageSrc
                }
                if (findUpdatedNews.categories) {
                    let _categories = Array.prototype.map.call(findUpdatedNews.categories, function(item) { return item.id; }).join(","); // "A,B,C"
                    data.categories = _categories
                }
                let createdData = await firebaseDb.collection('posts').add(data);
            }
        }

      })
    )
  }
  console.log(newsList.length);
}