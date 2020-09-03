/**
 * NewsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    list: async function (req, res) {
        let params = req.allParams();
        let page = params.page == undefined ? 1 : parseInt(params.page);
        let limit = params.limit == undefined ? 10 : parseInt(params.limit);
        let skip = (page - 1) * limit;
        let result = await News.find({ skip, limit }).populate("categories").populate("createdBy");
        res.send({
            page,
            rows: result
        });
    },

    get: async function (req, res) {
        let params = req.allParams();
        let result = await News.findOne({ id: params.id }).populate("categories").populate("createdBy");
        res.send(result);
    },

    bind: async function (req, res) {
        let result = await News.addToCollection(1, 'categories', 3);
        res.send(result);
    },

    create: async function (req, res) {
        let params = req.allParams();
        let result = await News.create({
            title: params.title,
            headline: params.headline,
            link: params.link,
            shortDesc: params.shortDesc,
            status: "in-queue",
            category: [1, 2],
            createdBy: params.createdBy,
            updatedBy: params.updatedBy,
        }).fetch();

        res.send(result);
    },

    update: async function (req, res) {
        let params = req.allParams();
        let result = await News.update({
            id: params.id
        }).set({
            title: params.title,
            headline: params.headline,
            link: params.link,
            shortDesc: params.shortDesc,
            status: "in-queue",
            category: [1, 2],
            createdBy: params.createdBy,
            updatedBy: params.updatedBy,
        }).fetch();

        res.send(result);
    },

    delete: async function (req, res) {
        let params = req.allParams();
        let result = await News.archiveOne({ id: params.id });
        res.send(result);
    },

    //newsid, typeid, subtypeid
    reportNewsByUser: async function (req, res) {
        let params = req.allParams();
        if (params && params.newsId) {
            let data = {
                typeId: params.typeId,
                subTypeId: params.subTypeId,
                newsId: params.newsId
            }
            if (req.currentUser && req.currentUser.id) {
                data.userId = req.currentUser.id;
            }
            let createReportByUser = await ReportByUser.create(data).intercept('UsageError', (err) => {
                err.message = 'Uh oh: ' + err.message;
                return ResponseService.json(400, res, "User could not be created", err);
            }).fetch();

            return ResponseService.json(200, res, "reported successfully", createReportByUser);
        }

    },

    //TODO: Will Remove it later
    restAllNewsData: async function (req, res) {
        require('fs');
        var filePath = './assets/data/news_list.json';
        var NewsArray = null;
        const jsonfile = require('jsonfile');
        await jsonfile.readFile(filePath, async function (err, obj) {
            if (err) {
                res.json({ err: err });
            }
            // console.dir(obj)
            NewsArray = obj;
        });

        NewsArray.forEach(element => {
            element.shortDesc.replace(/[\u0800-\uFFFF]/g, '')
        });
        //first delete all previous data
        await News.destroy({});

        let cloneObj = _.cloneDeep(NewsArray);
        let insertedData = await News.createEach(NewsArray).fetch();
        if(insertedData.length){
            console.log('insertedData', insertedData.length);
            for (let index = 0; index < insertedData.length; index++) {
                const news = insertedData[index];
                if (cloneObj[index].categories_ids.length){
                    await News.addToCollection(news.id, 'categories', cloneObj[index].categories_ids);
                }
            }
            let result = await News.find().populate("categories");
            return ResponseService.json(200, res, "get report successfully", result);
        }

    }

};

