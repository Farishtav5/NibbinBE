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
        console.log('skip', skip);
        console.log('limit', limit);
        let paginationQuery = ` group by n.id ORDER BY ${shortBy} ${orderBy} limit ${limit} offset ${skip}`;
        
        if(!req.accessSourceType){
            whereQuery += ` and n.status in ('published')`;
        }else{
            if (params.status){
                let tempStatus = (params.status).toString().split(",");
                whereQuery += ` and n.status in (${tempStatus.join(',')})`;
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
            tempCategories = (params.categories).toString().split(",");
            for (a in tempCategories) {
                tempCategories[a] = parseInt(tempCategories[a], 10);
            }
            whereQuery += ` and cc.id in (${tempCategories.join(',')})`;
        }
        if (params.query){
            whereQuery += ` or n.headline like '%${params.query}%' or
             n.shortDesc like '%${params.query}%' or 
             n.link like '%${params.query}%'`;
        }
        // sqlQuery = `SELECT DISTINCTROW n.*, CONCAT("[", GROUP_CONCAT(CONCAT('{name:"', cc.name, '", id:"',cc.id,'"}')), "]") as categories FROM news n
        sqlQuery = `SELECT DISTINCTROW n.*, 
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'name', cc.name,
                'id', cc.id
            )
        ) as categories FROM news n
        inner join category_news__news_categories c on n.id = c.news_categories
        inner join category cc on cc.id = c.category_news
        where n.delete = false`;
        let query = `${sqlQuery} ${whereQuery} ${paginationQuery}`;
        console.log('sqlQuery', sqlQuery);
        console.log('query', query);

        let result = await News.getDatastore().sendNativeQuery(query);
        result = result.rows;
        let totalNewsCountInDB = await News.getDatastore().sendNativeQuery(`${sqlQuery} ${whereQuery}`);
        totalNewsCountInDB = totalNewsCountInDB.length;

        
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
        let tilesObj = await News.find({delete: false});
        let tiles = {
            //'rejected'
            inQueueCount: _.filter(tilesObj, (t) => {return t.status === "in-queue"}).length,
            publishedCount: _.filter(tilesObj, (t) => {return t.status === "published"}).length,
            editRequiredCount: _.filter(tilesObj, (t) => {return t.status === "edit-required"}).length,
            scheduledCount: _.filter(tilesObj, (t) => {return t.status === "scheduled"}).length,
            inReviewCount: _.filter(tilesObj, (t) => {return t.status === "in-review"}).length,
            designedSubmittedCount: _.filter(tilesObj, (t) => {return t.status === "design-submitted"}).length,
            contentSubmittedCount: _.filter(tilesObj, (t) => {return t.status === "content-submitted"}).length,
            urlApprovedCount: _.filter(tilesObj, (t) => {return t.status === "url-approved"}).length,
            onHoldCount: _.filter(tilesObj, (t) => {return t.status === "on-hold"}).length,
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
        let querywhere = {};
        if (!params.id) {
            return ResponseService.json(400, res, "please provide news id");
        }

        if (params.status) {
            let tempStatus = (params.status).toString().split(",");
            querywhere.status = { in: tempStatus };
        }

        let newsObj = await News.find().where(querywhere).populate("categories").populate("createdBy");

        let index = _.findIndex(newsObj, { id: parseInt(params.id) });
        let prevId = 0;
        let nextId = null;
        if(index > 0){
            prevId =  newsObj[index - 1].id;
        }
        if(newsObj[index + 1] && newsObj[index + 1].id){
            nextId = newsObj[index + 1].id;
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
        let commentsOrder = { sort: 'createdAt DESC'};
        let result = await News.findOne({ id: params.id }).populate("categories").populate("createdBy").populate('comments', commentsOrder);
        if(result){
            let resultWithCommentsObj = await nestedPop.nestedPop(result, {
                comments: {
                  as: 'Comments',
                  populate: [
                    'commentedBy'
                  ]
                }
              });
            res.send(resultWithCommentsObj);
        }else{
            res.send(result);
        }
        
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
        }else{
            return ResponseService.json(400, res, "error to during create news");
        }

    },

    update: async function (req, res) {
        let params = req.allParams();
        if (!params.id) {
            return ResponseService.json(400, res, "please provide news id");
        }
        let findNews = await News.findOne({ id: params.id });
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
            if(params.status === "published"){
                objUpdate.publishedAt = new Date()
            }else if(params.status === "scheduled"){
                objUpdate.scheduledTo = params.dated
            }
        }

        if( (findNews.designSubmitted && objUpdate.contentSubmitted) || (findNews.contentSubmitted && objUpdate.designSubmitted) ){
            objUpdate.status = "in-review";
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

        if(result.length && result[0]){
            let updatedNews = result[0];
            if(updatedNews.status === "published"){
                let findUpdatedNews = await News.findOne({ id: updatedNews.id }).populate("categories");
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

        res.send(result);
    },

    delete: async function (req, res) {
        let params = req.allParams();
        let result = await News.update({ id: params.id }).set({
            delete: true
          }).fetch();
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

};

