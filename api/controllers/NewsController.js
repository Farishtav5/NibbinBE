/**
 * NewsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fs = require("fs");
const got = require("got");
const moment = require('moment');
const keyword_extractor = require("keyword-extractor");

activities = Utilities.activities;
UUID = Utilities.uuid;

const { IncomingWebhook } = require('@slack/webhook');
const SLACK_WEBHOOK_URL = sails.config.custom.slack_webhook_url;
const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);

module.exports = {

    // TODO: TO BE TEST
    list: async function (req, res) {
        let params = req.allParams();
        params.html = params.html === "true" ? true : false
        let page = params.page == undefined ? 1 : parseInt(params.page);
        let limit = params.limit == undefined ? 10 : parseInt(params.limit);
        let skip = (page - 1) * limit;
        // let sorted = 'dated DESC';
        let shortBy = (params && params.shortBy) ? params.shortBy : 'dated';
        let orderBy = (params && params.orderBy) ? params.orderBy : 'DESC';
        let query = { skip: skip, limit: limit, sort: shortBy + ' ' + orderBy};
        query.where = { type: '"news"'};
        
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
        let tempCategories = [];
        if (params.categories){
            tempCategories = (params.categories).toString().split(",");
            for (a in tempCategories) {
                tempCategories[a] = parseInt(tempCategories[a], 10);
            }
            tempCategories = tempCategories.filter(function (value) {
                return !Number.isNaN(value);
            });
            // _categoriesQuery = { where: { id: { in: tempCategories } }};
            // _categoriesQuery = { id: tempCategories };
        }
        let tempCategoriesStrings = [];
        let queryWithOr_for_category = [];
        if(tempCategories.length){
            // query.where.categories_ids = {in : tempCategories }
            tempCategoriesStrings = tempCategories.map(String);
            for (let i = 0; i < tempCategoriesStrings.length; i++) {
                const item = tempCategoriesStrings[i];
                queryWithOr_for_category.push({ categories_ids: { contains : item } });
            }
            query.where.or = queryWithOr_for_category;
        }

        if (params.query){
            query.where = {
                or: [
                    { headline: { contains: params.query } },
                    { shortDesc: { contains: params.query } },
                    { link: { contains: params.query } },
                    ...queryWithOr_for_category
                ] 
            };
        }
        query.where.delete = false;

        let _queryClone = _.omit(query, ['limit', 'skip', 'sort']);
        let newsList = await News.find(query).populate("createdBy").populate('imageId');
        let result = [];
        result = newsList;
        result.forEach((t)=>{
            // will be removed later
            if(!params.html) {
                t.shortDesc = contentExtractor(t.shortDesc)
            } 
            t.categories = t.categories_array;
            delete t.categories_array;
            if(t.imageId){
                let _image_id = _.cloneDeep(t.imageId);
                delete t.imageId;
                t.imageSrc = _image_id.imageSrc;
                t.imageSourceName = _image_id.imageSourceName;
                t.imageId = _image_id.id;
            }
        });

        let totalNewsCountInDB = await News.count(_queryClone);
        let tilesObj = await News.find({delete: false, type: '"news"'});
        let tiles = {
            //'rejected'
            inQueueCount: _.filter(tilesObj, (t) => {return t.status === "in-queue"}).length,
            publishedCount: _.filter(tilesObj, (t) => {return t.status === "published"}).length,
            editRequiredCount: _.filter(tilesObj, (t) => {return t.status === "edit-required"}).length,
            scheduledCount: _.filter(tilesObj, (t) => {return t.status === "scheduled"}).length,
            inReviewCount: _.filter(tilesObj, (t) => {return t.status === "in-review"}).length,
            inDraftCount: _.filter(tilesObj, (t) => {return t.status === "draft"}).length,
            inDesignCount: _.filter(tilesObj, (t) => {return t.status === "in-design"}).length,
            inContentCount: _.filter(tilesObj, (t) => {return t.status === "in-content"}).length,
            onHoldCount: _.filter(tilesObj, (t) => {return t.status === "on-hold"}).length,
            autoScheduledCount: _.filter(tilesObj, (t) => {return t.status === "auto-scheduled"}).length,
            rejectedCount: _.filter(tilesObj, (t) => {return t.status === "rejected"}).length,
        }
        // will remove in next commit
        let settings = {
            newsCount: 5,
            graphicsCount: 1
        }
        res.send({
            page,
            total: totalNewsCountInDB,
            total_news: result.length,
            rows: result,
            tiles,
            settings
        });

    },

    //TODO: added by SATISH = it should be removed after test above function
    list_old: async function (req, res) {
        let params = req.allParams();
        let page = params.page == undefined ? 1 : parseInt(params.page);
        let limit = params.limit == undefined ? 10 : parseInt(params.limit);
        let skip = (page - 1) * limit;
        // let sorted = 'dated DESC';
        let shortBy = (params && params.shortBy) ? params.shortBy : 'dated';
        let orderBy = (params && params.orderBy) ? params.orderBy : 'DESC';

        // let query = { skip: skip, limit: limit, sort: shortBy + ' ' + orderBy};
        // query.where = {};
        

        // if(!req.accessSourceType){
        //     query.where.status = { in: ["published"] }
        // }else{
        //     if (params.status){
        //         let tempStatus = (params.status).toString().split(",");
        //         query.where.status = { in: tempStatus };
        //     }
        // }
        // if(params.headline){
        //     query.where.headline = { contains: params.headline };
        // }
        // if (params.link){
        //     query.where.link = { contains: params.link };
        // }
        
        // if (params.addedFrom){
        //     // query.where.createdAt['>='] = new Date('2018-08-21T14:56:21.774Z').getTime();
        //     query.where.createdAt = { '>=' : new Date(params.addedFrom).getTime() }
        // }
        // if (params.addedTo){
        //     // query.where.createdAt['<='] = new Date('2018-08-25T14:56:21.774Z').getTime();
        //     query.where.createdAt = { '<=' : new Date(params.addedTo).getTime() }
        // }
        // let _categoriesQuery = {};
        // let tempCategories = [];
        // if (params.categories){
        //     tempCategories = (params.categories).toString().split(",");
        //     for (a in tempCategories) {
        //         tempCategories[a] = parseInt(tempCategories[a], 10);
        //     }
        //     _categoriesQuery = { where: { id: { in: tempCategories } }};
        //     // _categoriesQuery = { id: tempCategories };
        // }
        // if (params.query){
        //     query.where = {
        //         or: [
        //             { headline: { contains: params.query } },
        //             { shortDesc: { contains: params.query } },
        //             { link: { contains: params.query } },
        //         ] 
        //     };
        // }
        // query.where.delete = false;
        let sqlQuery = '';
        let whereQuery = '';
        let paginationQuery = ` group by n.id ORDER BY ${shortBy} ${orderBy} limit ${limit} offset ${skip}`;
        
        if(!req.accessSourceType){ // accessSourceType ? 
            whereQuery += ` and n.status in ('published')`;
        }else{
            if (params.status){
                let tempStatus = (params.status).toString().split(",").map(word => `'${word.trim()}'`).join(',');
                whereQuery += ` and n.status in (${tempStatus})`;
            }
        }
        if(params.headline){
            whereQuery += ` and n.headline like '%${params.headline}%'`;
        }
        if (params.link){
            whereQuery += ` and n.link like '%${params.link}%'`;
        }
        
        if (params.addedFrom){
            whereQuery += ` and n.createdAt >= '${new Date(params.addedFrom).getTime()}'`;
        }
        if (params.addedTo){
            whereQuery += ` and n.createdAt <= '${new Date(params.addedTo).getTime()}'`;
        }
        let _categoriesQuery = {};
        let tempCategories = [];
        if (params.categories){
            tempCategories = (params.categories).toString().replace(/,(\s+)?$/, '').split(",");
            for (a in tempCategories) {
                tempCategories[a] = parseInt(tempCategories[a], 10);
            }
            whereQuery += ` and cc.id in (${tempCategories.join(',')})`;
        }
        if (params.query){
            whereQuery += ` and (n.headline like '%${params.query}%' or
             n.shortDesc like '%${params.query}%' or 
             n.link like '%${params.query}%') `;
        }
        // sqlQuery = `SELECT DISTINCTROW n.*, CONCAT("[", GROUP_CONCAT(CONCAT('{name:"', cc.name, '", id:"',cc.id,'"}')), "]") as categories FROM news n

        sqlQuery = `SELECT DISTINCTROW n.*, 
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'name', cc.name,
                'id', cc.id
            )
        ) as categories, im.imageSrc, im.imageSourceName FROM news n
        inner join category_news__news_categories c on n.id = c.news_categories
        inner join category cc on cc.id = c.category_news   
        left join images im on n.imageId = im.id OR n.imageId = null
        where n.delete = false AND n.type = '"news"'`;
        let query = `${sqlQuery} ${whereQuery} ${paginationQuery}`;
        // console.log('sqlQuery', sqlQuery);

        let result = await News.getDatastore().sendNativeQuery(query);
        result = result.rows;
        let totalNewsCountInDB = await News.getDatastore().sendNativeQuery(`${sqlQuery} ${whereQuery} group by n.id`);
        totalNewsCountInDB = totalNewsCountInDB.rows.length;

        // let _queryClone = _.omit(query, ['limit', 'skip', 'sort']);
        // let newsList = await News.find(query).populate("categories", _categoriesQuery).populate("createdBy");
        // console.log('_categoriesQuery', JSON.stringify(_categoriesQuery), tempCategories);
        // let result = [];
        // // if(tempCategories.length){
        // //     result = newsList.filter(({categories}) => {
        // //         return categories.some(({id})=> {
        // //             return tempCategories.indexOf(id) != -1;
        // //         })
        // //     });
        // // }else{
        // // }
        // result = newsList;
        result.forEach((t)=>{
            t.categories = JSON.parse(t.categories);
            t.title = t.title ? JSON.parse(t.title) : '';
            t.headline = t.headline ? JSON.parse(t.headline) : '';
            t.imageSrc = t.imageSrc ? JSON.parse(t.imageSrc) : '';
            t.shortDesc = t.shortDesc ? JSON.parse(t.shortDesc) : '';
            t.link = t.link ? JSON.parse(t.link) : '';
            t.type = t.type ? JSON.parse(t.type) : '';
        });

        // let totalNewsCountInDB = await News.count(_queryClone);
        // let tilesObj = await News.find({delete: false});


        let _queryForTiles = `SELECT DISTINCTROW n.*, im.imageSrc FROM news n   
        inner join category_news__news_categories c on n.id = c.news_categories
        inner join category cc on cc.id = c.category_news
        left join images im on n.imageId = im.id OR n.imageId = null
        where n.delete = false AND n.type = '"news"'`;
        // let _queryForTiles = `SELECT DISTINCTROW n.*, im.imageSrc FROM news n
        // left join images im on n.imageId = im.id OR n.imageId = null
        // where n.delete = false`;
        let tilesObj = await News.getDatastore().sendNativeQuery(`${_queryForTiles} group by n.id`);
        tilesObj = tilesObj.rows;
        let tiles = {
            //'rejected'
            inQueueCount: _.filter(tilesObj, (t) => {return t.status === "in-queue"}).length,
            publishedCount: _.filter(tilesObj, (t) => {return t.status === "published"}).length,
            editRequiredCount: _.filter(tilesObj, (t) => {return t.status === "edit-required"}).length,
            scheduledCount: _.filter(tilesObj, (t) => {return t.status === "scheduled"}).length,
            inReviewCount: _.filter(tilesObj, (t) => {return t.status === "in-review"}).length,
            inDraftCount: _.filter(tilesObj, (t) => {return t.status === "draft"}).length,
            inDesignCount: _.filter(tilesObj, (t) => {return t.status === "in-design"}).length,
            inContentCount: _.filter(tilesObj, (t) => {return t.status === "in-content"}).length,
            onHoldCount: _.filter(tilesObj, (t) => {return t.status === "on-hold"}).length,
            autoScheduledCount: _.filter(tilesObj, (t) => {return t.status === "auto-scheduled"}).length,
            rejectedCount: _.filter(tilesObj, (t) => {return t.status === "rejected"}).length,
        }
        res.send({
            page,
            total: totalNewsCountInDB,
            total_news: result.length,
            rows: result,
            tiles
        });
    },

    prevNextNews: async function (req, res) {
        let params = req.allParams();
        params.type = params.type ? params.type : 'news'
        let querywhere = {type: JSON.stringify(params.type)};
        if (!params.id) {
            return ResponseService.json(400, res, "please provide news id");
        }

        if (params.status) {
            let tempStatus = (params.status).toString().split(",");
            querywhere.status = { in: tempStatus };
        }

        let newsObj = await News.find().where(querywhere).populate("categories").populate('imageId').populate("createdBy");
        let index = _.findIndex(newsObj, { id: parseInt(params.id) });
        let prevId = 0;
        let nextId = null;
        if(index > 0){
            prevId =  newsObj[index - 1].id;
        }
        if(newsObj[index + 1] && newsObj[index + 1].id){
            nextId = newsObj[index + 1].id;
        }
        if(newsObj[index] && newsObj[index].imageId){
            let _image_id = null;
            _image_id = _.cloneDeep(newsObj[index].imageId);
            newsObj[index].imageSrc = _image_id.imageSrc;
            newsObj[index].imageSourceName = _image_id.imageSourceName;
            newsObj[index].imageId = _image_id.id;
        }
        res.send({
            currentId: params.id,
            prevId: prevId,
            nextId: nextId,
            news: newsObj[index]
        });
    },

    get: async function (req, res) {
        let params = req.allParams();
        params.type = params.type ? params.type : 'news'
        params.html = params.html === "true" ? true : false
        let commentsOrder = { sort: 'createdAt DESC'};
        if(params && params.id){
            let result = await News.findOne({ id: params.id }).populate("categories").populate('imageId').populate("createdBy").populate('comments', commentsOrder);
            if(result){
                if(!params.html) {
                    result.shortDesc = contentExtractor(result.shortDesc);
                }
                let resultWithCommentsObj = await nestedPop.nestedPop(result, {
                    comments: {
                    as: 'Comments',
                    populate: [
                        'commentedBy'
                    ]
                    }
                });
                if(resultWithCommentsObj && resultWithCommentsObj.imageId){
                    let _image_id = _.cloneDeep(resultWithCommentsObj.imageId);
                    resultWithCommentsObj.imageSrc = _image_id.imageSrc;
                    resultWithCommentsObj.imageSourceName = _image_id.imageSourceName;
                    resultWithCommentsObj.imageId = _image_id.id;
                }
                let bookmarksResult = null;
                if(req.currentUser && req.currentUser.id){
                    bookmarksResult = await Bookmark.find({
                        userId: req.currentUser.id
                    }).intercept('UsageError', (err) => {
                        err.message = 'Uh oh: ' + err.message;
                        return ResponseService.json(400, res, err);
                    });
                }
                if(bookmarksResult){
                    bookmarksResult = _.uniq(bookmarksResult, 'newsId');
                    resultWithCommentsObj.bookmarks = bookmarksResult;
                }
                res.send(resultWithCommentsObj);
            }else{
                return ResponseService.json(404, res, `No ${params.type} exists for this id`);
            }
        }else{
            return ResponseService.json(400, res, "provide news id");
        }
        
    },

    bind: async function (req, res) {
        let result = await News.addToCollection(1, 'categories', 3);
        res.send(result);
    },

    create: async function (req, res) {
        let params = req.allParams();
        params.type = params.type ? params.type : 'news';
        let _catObj = {
            categories_ids: '',
            categories_array: ''
        };
        if (params.categories){
            _catObj.categories_ids = params.categories.join(',');
            let _catarr = await Category.find({id: params.categories });
            _catObj.categories_array = _catarr;
        }
        let createdNewsObj = await News.create({
            title: params.title ? params.title : '',
            headline: params.headline ? params.headline : '',
            link: params.link ? params.link : '',
            shortDesc: params.shortDesc ? params.shortDesc : '',
            status: params.type === "graphics" ? "in-review" : "in-queue",
            actions: params.actions ? params.actions : '',
            dated: new Date(),
            createdBy: req.currentUser.id, //params.createdBy,
            updatedBy: req.currentUser.id, //params.updatedBy,
            type: params.type,
            categories_ids: (_catObj.categories_ids) ? _catObj.categories_ids : '',
            categories_array: (_catObj.categories_array) ? _catObj.categories_array : ''
        }).fetch();

        if(createdNewsObj){
            if (params.categories){
                await News.addToCollection(createdNewsObj.id, 'categories', params.categories);
            }
            await sails.helpers.createActivityLog.with({
                newsId: createdNewsObj.id,
                createdBy: req.currentUser.id,
                status: createdNewsObj.status,
                action: "NewsController - create"
            });
            return ResponseService.json(200, res, "news created", createdNewsObj);
        }else{
            return ResponseService.json(400, res, "error to during create news");
        }

    },

    update: async function (req, res) {
        let params = req.allParams();
        if (!params.id) {
            return ResponseService.json(400, res, "please provide news id");
        }
        let tempIds = (params.id).toString().replace(/,(\s+)?$/, '').split(",");
        for (let a in tempIds) {
            tempIds[a] = parseInt(tempIds[a], 10);
        }

        let findNews = await News.find({ id: tempIds });
        if(!findNews){
            return ResponseService.json(404, res, "news not found");
        }

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
        
        if(params.categories){
            objUpdate.categories = params.categories;
            if (params.categories){
                objUpdate.categories_ids = params.categories.join(',');
                let _catarr = await Category.find({id: params.categories });
                objUpdate.categories_array = _catarr;
            }
        }
        
        if(params.designSubmitted){
            objUpdate.designSubmitted = params.designSubmitted;
        }else if(params.designSubmitted == false){
            objUpdate.designSubmitted = params.designSubmitted;
        }

        if(params.contentSubmitted){
            objUpdate.contentSubmitted = params.contentSubmitted;
        }else if(params.contentSubmitted == false){
            objUpdate.contentSubmitted = params.contentSubmitted;
        }

        if(params.status){
            objUpdate.status = params.status;
            let _date = new Date(params.dated);
            console.log('_date', _date, params.dated);
            if(params.status === "published"){
                objUpdate.publishedAt = _date ? moment(_date).format("YYYY-MM-DD hh:mm:ss") : moment().format("YYYY-MM-DD hh:mm:ss");
                objUpdate.dated = _date ? moment(_date).format("YYYY-MM-DD hh:mm:ss") : moment().format("YYYY-MM-DD hh:mm:ss");
                console.log('published Date: ', objUpdate.publishedAt, objUpdate.dated);
            }else if(params.status === "scheduled"){
                objUpdate.scheduledTo =  moment(_date).format("YYYY-MM-DD hh:mm:ss") //params.dated
            }
        }

        objUpdate.actions = {
            share: params.share ? params.share : false,
            report: params.report ? params.report : false
        }

        if( (findNews.designSubmitted && objUpdate.contentSubmitted) || (findNews.contentSubmitted && objUpdate.designSubmitted) ){
            objUpdate.status = "in-review";
        }
        objUpdate.send_notification = params.send_notification ? true : false;

        // if(params.imageSrc){
        //     objUpdate.imageSrc = params.imageSrc;
        // }
        // if(params.imageSourceName){
        //     objUpdate.imageSourceName = params.imageSourceName;
        // }
        if(params.imageId){
            objUpdate.imageId = params.imageId;
            if(params.imageSourceName){
                objUpdate.imageSourceName = params.imageSourceName;
                await Images.update({id: params.imageId}).set({imageSourceName: params.imageSourceName}).fetch();
            }
        }
        
        if(params.status === activities.NEWS.STATUS.IN_DESIGN){
            let _automateImageId = await automateImageForNews_UpdateNews(tempIds);
            if(_automateImageId){
                objUpdate.imageId = _automateImageId;
                objUpdate.status = "in-review";
            }
        }

        
        let result = await News.update({
            id: tempIds //params.id
        }).set(objUpdate).fetch();

        if(result.length){
            let updatedNews = result;
            for (let i = 0; i < updatedNews.length; i++) {
                const _newsItem = updatedNews[i];
                if(_newsItem && _newsItem.imageId){
                    let findImageById = await Images.findOne({ id: _newsItem.imageId });
                    if(findImageById){
                        let _image_id = _.cloneDeep(findImageById);
                        result[i].imageSrc = _image_id.imageSrc;
                        result[i].imageSourceName = _image_id.imageSourceName;
                        result[i].imageId = _image_id.id;
                    }
                }
                if(_newsItem.status === activities.NEWS.STATUS.IN_CONTENT){
                    await updateApprovedNewsForMetaSource(_newsItem);
                }
                await sails.helpers.createActivityLog.with({
                    newsId: _newsItem.id,
                    createdBy: req.currentUser.id,
                    status: _newsItem.status,
                    action: "NewsController - update"
                });
                if(sails.config.environment === 'production') {
                    if(_newsItem.status === "published" && _newsItem.send_notification === true) {
                        let findUpdatedNews = await News.findOne({ id: _newsItem.id }).populate("categories");
                        let firebaseDb = sails.config.firebaseDb();
                        let data = {
                            postValue: findUpdatedNews.id,
                            title: findUpdatedNews.headline,
                            type: findUpdatedNews.type
                        }
                        if (result[i].imageSrc) {
                            data.imageSrc = result[i].imageSrc
                        }
                        if (findUpdatedNews.categories) {
                            let _categories = Array.prototype.map.call(findUpdatedNews.categories, function(item) { return item.id; });//.join(","); // "A,B,C"
                            data.categories = _categories
                        }
                        let createdData = await firebaseDb.collection('posts').add(data);
                        console.log('firebase notification - news published');
                    }
                    if(_newsItem.status === "published" && _newsItem.tweet === true) {
                        
                        let _tweetResult = await sails.helpers.twitterIntegration.with({
                            newsId: _newsItem.id,
                            imgSrc: result[i].imageSrc,
                            headline: _newsItem.headline
                        });
                        console.log('tweet by manual publish', _tweetResult);
                    }
                }
            }
        }

        res.send(result);
    },

    delete: async function (req, res) {
        let params = req.allParams();
        let result = await News.updateOne({ id: params.id }).set({
            delete: true
          });
        await sails.helpers.createActivityLog.with({
            newsId: result.id,
            createdBy: req.currentUser.id,
            message: activities.NEWS.DELETED,
            action: "NewsController - delete"
        });
        res.send(result);
    },

    //newsid, typeid, subtypeid
    reportNewsByUser: async function (req, res) {
        let params = req.allParams();
        if (params && params.newsId) {
            let data = {
                typeId: params.typeId,
                subTypeId: params.subTypeId,
                newsId: params.newsId,
                device: {
                    platform: params.platform,
                    name: params.deviceName,
                    version: params.deviceVersion,
                    model: params.deviceModel
                }
            }
            if (req.currentUser && req.currentUser.id) {
                data.userId = req.currentUser.id;
            }
            let createReportByUser = await ReportByUser.create(data).intercept('UsageError', (err) => {
                err.message = 'Uh oh: ' + err.message; 
                return ResponseService.json(400, res, "User could not be created", err);
            }).fetch();

            let result = await ReportByUser.findOne({id: createReportByUser.id }).populate('subTypeId').populate('typeId').populate('userId').populate('newsId');
            let resultWithImgObj = {}
            if(result){
                resultWithImgObj = await nestedPop.nestedPop(result, {
                    newsId: {
                    as: 'News',
                    populate: [
                        'imageId'
                    ]
                    }
                });
                if(resultWithImgObj && resultWithImgObj.newsId && resultWithImgObj.newsId.imageId){
                    let _image_id = _.cloneDeep(resultWithImgObj.newsId.imageId);
                    resultWithImgObj.imageSrc = _image_id.imageSrc;
                    resultWithImgObj.imageSourceName = _image_id.imageSourceName;
                    resultWithImgObj.imageId = _image_id.id;
                };
                let news = result.newsId;
                let user = result.userId;
                let userInfo = user ? `*User Name*: ${user.name}\n*User Email*: ${user.email} ` :  "*User*: Anonymous";
                (async () => {
                    await webhook.send({
                    blocks : [
                        {
                            "type": "section",
                            "block_id": "section567",
                            "accessory": {
                                "type": "image",
                                "image_url": resultWithImgObj.imageSrc,
                                "alt_text": `${resultWithImgObj.imageSourceName} image` ,
                            },
                            "text": {
                                "type": "mrkdwn",
                                "text": `*${news.headline.trim()}*\nID: ${news.id}\nType: ${news.type}`
                            }
                        },
                        {
                            "type": "section",
                            "block_id": "section789",
                            "fields": [
                                {
                                    "type": "mrkdwn",
                                    "text": `*${result.typeId.title}*\n${result.subTypeId.title}`
                                }
                            ]
                        },
                        {
                            "type": "section",
                            "block_id": "section788",
                            "fields": [
                                {
                                    "type": "mrkdwn",
                                    "text": `${userInfo}`
                                }
                            ]
                        }
                    ]
                    });
                })();
            }
            return ResponseService.json(200, res, "reported successfully", createReportByUser);
        }

    },

    newsStatusList: async function (req, res) {
      let statusList = [
        'in-queue',
        'in-content',
        'draft',
        'in-design',
        'in-review',
        'edit-required',
        'published',
        'scheduled',
        'rejected',
        'on-hold',
        'auto-scheduled'
      ];
      res.send(statusList);
    },

    previewSourceLink: async function (req, res) {
      //
    //   let urls = [
    //         "https://www.medicalnewstoday.com/articles/friendly-e-coli-may-protect-the-gut-from-their-deadly-cousin",
    //         "https://www.fiercebiotech.com/medtech/fda-opens-door-to-batch-testing-for-covid-19-quest-diagnostics-green-lights",
    //         "https://www.sciencedaily.com/releases/2020/07/200717133231.htm",
    //         "https://www.statnews.com/2020/07/14/moderna-covid19-vaccine-first-data-show-spurs-immune-response/",
    //         "https://www.fiercebiotech.com/medtech/thermo-fisher-throws-extra-billion-to-buy-covid-19-testing-supplier-qiagen",
    //     ];;
    //   const {body} = await got(urls[2]);
      res.send("😜");
    },

    updateNewsImageByPickFromGallery: async function (req, res) {
        let params = req.allParams();
        let updatedNewsArray = [];
        if (!params.id) {
            return ResponseService.json(400, res, "please provide news id");
        }
        let tempIds = (params.id).toString().replace(/,(\s+)?$/, '').split(",");
        for (let a in tempIds) {
            tempIds[a] = parseInt(tempIds[a], 10);
        }

        let findNews = await News.find({ id: tempIds });
        if(!findNews.length){
            return ResponseService.json(404, res, "news not found");
        }
        if(findNews.length){
            for (let i = 0; i < findNews.length; i++) {
                let _newsItem = findNews[i];
                if(_newsItem){
                    let _imgId = null;
                    let imgObj = await searchImageFromGalleryByTags(_newsItem);
                    if(imgObj){
                        _imgId = imgObj.imageId;
                    }
                    let updatedNewsObj = {};
                    if(_imgId) updatedNewsObj.imageId = _imgId;
                    
                    if(_newsItem.status === activities.NEWS.STATUS.IN_DESIGN && updatedNewsObj.imageId){
                        updatedNewsObj.status = activities.NEWS.STATUS.IN_REVIEW;
                    }
                    let result = await News.update({
                        id: _newsItem.id
                    }).set(updatedNewsObj).fetch();
                    updatedNewsArray.push(result[0]);
                    await sails.helpers.createActivityLog.with({
                        newsId: _newsItem.id,
                        createdBy: req.currentUser.id,
                        status: result[0].status,
                        action: "NewsController - update - imagePickFromGallery"
                    });
                }
            }
            return ResponseService.json(200, res, "news updated", updatedNewsArray);
        }
    },

    //TODO: Will Remove it later
    restAllNewsData: async function (req, res) {
        var filePath = './assets/data/1-1911-with-meta-source.json';
        var NewsArray = null;
        const jsonfile = require('jsonfile');
        await jsonfile.readFile(filePath, async function (err, obj) {
            if (err) {
                res.json({ err: err });
            }
            // console.dir(obj)
            NewsArray = obj;
            // NewsArray.forEach(element => {
            //     element.shortDesc.replace(/[\u0800-\uFFFF]/g, '')
            // });

            //first delete all previous data
            // await News.destroy({});

            let cloneObj = _.cloneDeep(NewsArray);
            console.log('NewsArray length', NewsArray.length);
            let insertedData = await News.createEach(NewsArray).fetch();
            // if (insertedData.length) {
            //     console.log('insertedData', insertedData.length);
            //     for (let index = 0; index < insertedData.length; index++) {
            //         const news = insertedData[index];
            //         if (cloneObj[index].categories_ids.length) {
            //             await News.addToCollection(news.id, 'categories', cloneObj[index].categories_ids);
            //         }
            //     }
            // }
            let result = await News.find().populate("categories");
            return ResponseService.json(200, res, "get report successfully", result);
        });

        

    },

    findCovid19: async function (req, res) {
        let params = req.allParams();
        
        let query = {};
        query.where = {};

        if (params.status){
            let tempStatus = (params.status).toString().split(",");
            query.where.status = { in: tempStatus };
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
        // let result = await News.find(query);
        let result = await News.update(query).set({
            delete: true
          }).fetch();
        res.send({
            total: result.length,
            rows: result,
        });
    },

    demoFetch: async function (req, res) {
        // let data = await sails.helpers.scrapImageFromUrl.with({
        //     url: 'https://www.fiercebiotech.com/medtech/fda-opens-door-to-batch-testing-for-covid-19-quest-diagnostics-green-lights',
        // });
        // let result = await downloadImageFromSource_and_UploadOnS3(data.mainImage);
        // res.send({data:data, result:result});
        let params = req.allParams();
        let news = await News.findOne({ id: params.id });
        let findImageById = await Images.findOne({ id: news.imageId });
        if(findImageById){
            let _image_id = _.cloneDeep(findImageById);
            news.imageSrc = _image_id.imageSrc;
            news.imageSourceName = _image_id.imageSourceName;
        }
        let tt = await sails.helpers.twitterIntegration.with({
            newsId: news.id,
            imgSrc: news.imageSrc,
            headline: news.headline
        })
        // let dd = await automateImageForNews_UpdateNews(params.id);
        res.send({dd: tt});

        // let result = await News.find().populate("categories");
        // return ResponseService.json(200, res, "get report successfully", result);
    }

};

async function updateApprovedNewsForMetaSource(news) {
    if(news && news.link){
        let metaInfoFromSource = await sails.helpers.scrapImageFromUrl.with({
            url: news.link,
        });
        if(metaInfoFromSource){
            let metaInfo = metaInfoFromSource;
            let result = await News.update({
                id: news.id
            }).set({metaSource: metaInfo}).fetch();
            console.log('updated Meta info ', result[0].status);
            return result;
        }
    }
}

async function downloadImageFromSource_and_UploadOnS3(imagepath) {
    let url = imagepath;
    
    const fileName = "assets/images/demo1.jpg";
    // const downloadStream = got.stream(url);
    // const fileWriterStream = fs.createWriteStream(fileName);

    return new Promise(resolve => {
        const downloadStream = got.stream(url);
        const fileWriterStream = fs.createWriteStream(fileName);
        downloadStream
        .on("downloadProgress", ({ transferred, total, percent }) => {
            const percentage = Math.round(percent * 100);
            console.error(`progress: ${transferred}/${total} (${percentage}%)`);
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

            let dirname = ((sails.config.environment === 'qa' || sails.config.environment === 'development') ? 'dev_images' : 'images');

            // setting up s3 upload parameters
            const params = {
                Bucket: 'cdn-nibbin',
                Key: dirname + '/' + UUID() + '.png', // file name you want to save as
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
                fs.unlinkSync(fileName);
                // return data.Location;
                resolve(data.Location);
            });
            // return true;
        });

        downloadStream.pipe(fileWriterStream);
    })
}

async function searchImageFromGalleryByTags(news) {
    //
    let AllGaleryImages = await Images.find();
    let matchedArrayWithImages = [];

    // let _newsTitle_WordsArray = string_to_array(removeSymbol(news.headline));
    // let _newsShortDesc_WordsArray = string_to_array(removeSymbol(news.shortDesc));
    let _newsTitle_WordsArray = find_key_words(news.headline);
    news.shortDesc = contentExtractor(news.shortDesc)
    let _newsShortDesc_WordsArray = find_key_words(news.shortDesc);
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

    // res.send({
    //     maxItem, 
    //     selected: maxXObject[Math.floor(Math.random() * maxXObject.length)],
    //     maxXObject,
    //     // selected: matchedArrayWithImages[Math.floor(Math.random() * matchedArrayWithImages.length)], //old
    //     // selected2: matchedArrayWithImages[_.random(matchedArrayWithImages.length-1)],
    //     itemsArray,
    //     matchedArrayWithImages, 
    //     headline: news.headline, 
    //     brief: news.shortDesc,
    //     // news, 
    //     _newsTitle_WordsArray, _newsShortDesc_WordsArray
    // });

}

async function automateImageForNews_UpdateNews(newsId) {
    let url = require('url');
    let news = await News.findOne({ id: newsId });
    if(news && news.metaSource && news.metaSource.mainImage && validURL(news.metaSource.mainImage)){
        let uploadImageOnS3 = await downloadImageFromSource_and_UploadOnS3(news.metaSource.mainImage);
        let sourceName = extractHostname(news.link); //url.parse(news.link).hostname;
        // res.send({uploadImageOnS3, sourceName});
        if(uploadImageOnS3){
            let _imageData = {
                imageSrc: uploadImageOnS3,
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
        let imgObj = await searchImageFromGalleryByTags(news);
        if(imgObj){
            return imgObj.imageId;
        }else{
            return null;
        }
    }
}

function contentExtractor(shortDesc) {
    if(shortDesc) {
        let str = shortDesc.replace(/<[p]+>|<[li]+>/g, "\n");
        return str.replace(/<[^>]+>/g, '').trim();
    } else return ""
    
};

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

function removeSymbol(str, symbol = ","){
    var newString = "";
    for(var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if(char != symbol){
            newString = newString + char;
        }
    }
    return newString.toLowerCase();
}
function string_to_array(str) {
    return str.trim().toLowerCase().split(" ");
};

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
}

