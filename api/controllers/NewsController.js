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
        // let sorted = 'dated DESC';
        let shortBy = (params && params.shortBy) ? params.shortBy : 'dated';
        let orderBy = (params && params.orderBy) ? params.orderBy : 'DESC';

        let query = { skip: skip, limit: limit, sort: shortBy + ' ' + orderBy};
        query.where = {};

        if(!req.accessSourceType){
            query.where.status = { in: ["published"] }
        }else{
            if (params.status){
                let tempStatus = (params.status).toString().split(",");
                query.where.status = { in: tempStatus };
            }
        }
        if(params.headline){
            query.where.headline = { contains: params.headline };
        }
        if (params.link){
            query.where.link = { contains: params.link };
        }
        
        if (params.addedFrom){
            // query.where.createdAt['>='] = new Date('2018-08-21T14:56:21.774Z').getTime();
            query.where.createdAt = { '>=' : new Date(params.addedFrom).getTime() }
        }
        if (params.addedTo){
            // query.where.createdAt['<='] = new Date('2018-08-25T14:56:21.774Z').getTime();
            query.where.createdAt = { '<=' : new Date(params.addedTo).getTime() }
        }
        let _categoriesQuery = {};
        if (params.categories){
            let tempCategories = (params.categories).toString().split(",");
            for (a in tempCategories) {
                tempCategories[a] = parseInt(tempCategories[a], 10);
            }
            _categoriesQuery = { where: { id: { in: tempCategories } }};
        }
        if (params.query){
            query.where = {
                or: [
                    { headline: { contains: params.query } },
                    { shortDesc: { contains: params.query } },
                    { link: { contains: params.query } },
                ] 
            };
        }

        let _queryClone = _.omit(query, ['limit', 'skip', 'sort']);
        let result = await News.find(query).populate("categories", _categoriesQuery).populate("createdBy");
        let totalNewsCountInDB = await News.count(_queryClone);
        res.send({
            page,
            total: totalNewsCountInDB,
            rows: result,
        });
    },

    get: async function (req, res) {
        let params = req.allParams();
        let commentsOrder = { sort: 'createdAt DESC'};
        let result = await News.findOne({ id: params.id }).populate("categories").populate("createdBy").populate('comments', commentsOrder);
        res.send(result);
    },

    bind: async function (req, res) {
        let result = await News.addToCollection(1, 'categories', 3);
        res.send(result);
    },

    create: async function (req, res) {
        let params = req.allParams();
        let createdNewsObj = await News.create({
            title: params.title,
            headline: params.headline,
            link: params.link,
            shortDesc: params.shortDesc,
            status: "in-queue",
            dated: new Date(),
            createdBy: req.currentUser.id, //params.createdBy,
            updatedBy: req.currentUser.id //params.updatedBy,
        }).fetch();

        if(createdNewsObj){
            if (params.categories){
                await News.addToCollection(createdNewsObj.id, 'categories', params.categories);
            }

            try {
                let firebaseDb = sails.config.firebaseDb();
                let data = {
                    postValue: createdNewsObj.id,
                    title: createdNewsObj.title
                }
                if (createdNewsObj.imageSrc) {
                    data.imageSrc = createdNewsObj.imageSrc
                }
                if (params.categories) {
                    data.categories = params.categories
                }
                let createdData = await firebaseDb.collection('posts').add(data);
                return ResponseService.json(200, res, "added to fdb", createdNewsObj);
            } catch (error) {
                console.log('firebaseDb : ', error);
                return ResponseService.json(400, res, "error to fdb");
            }
        }else{
            return ResponseService.json(400, res, "error to during create news");
        }

    },

    update: async function (req, res) {
        let params = req.allParams();
        let objUpdate = {
            updatedBy: req.currentUser.id //params.updatedBy,
        }
        if(params.title){
            objUpdate.title = params.title;
        }
        if(params.headline){
            objUpdate.headline = params.headline;
        }
        if(params.link){
            objUpdate.link = params.link;
        }
        if(params.shortDesc){
            objUpdate.shortDesc = params.shortDesc;
        }
        if(params.status){
            objUpdate.status = params.status;
        }
        if(params.categories){
            objUpdate.categories = params.categories;
        }
        
        if(params.designSubmitted){
            objUpdate.designSubmitted = params.designSubmitted;
        }
        if(params.contentSubmitted){
            objUpdate.contentSubmitted = params.contentSubmitted;
        }
        if(params.imageSrc){
            objUpdate.imageSrc = params.imageSrc;
        }
        if(params.imageSourceName){
            objUpdate.imageSourceName = params.imageSourceName;
        }
        let result = await News.update({
            id: params.id
        }).set(objUpdate).fetch();

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
        var filePath = './assets/data/news_list.json';
        var NewsArray = null;
        const jsonfile = require('jsonfile');
        await jsonfile.readFile(filePath, async function (err, obj) {
            if (err) {
                res.json({ err: err });
            }
            // console.dir(obj)
            NewsArray = obj;
            NewsArray.forEach(element => {
                element.shortDesc.replace(/[\u0800-\uFFFF]/g, '')
            });

            //first delete all previous data
            await News.destroy({});

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
        });

        

    }

};

