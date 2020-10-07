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
          '>=' : last15minutesTime,
          '<=' : currentTime
        }

        let newsObj = await News.findOne({ status: "scheduled", scheduledTo: timeCondition });
        if(newsObj){
          runAsyncPublishPost();
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
      })
    )
  }
  console.log(newsList.length);
}