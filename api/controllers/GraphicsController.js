/**
 * WebsiteController
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
        let shortBy = (params && params.shortBy) ? params.shortBy : 'updatedAt';
        let orderBy = (params && params.orderBy) ? params.orderBy : 'DESC';

        let query = { skip: skip, limit: limit, sort: shortBy + ' ' + orderBy};
        query.where = { type: '"graphics"', delete: false };

        let totalCountQuery = {}
        totalCountQuery.where = { delete: false, type: '"graphics"' }

        if(!req.accessSourceType){
            query.where.status = { in: ["published"] }
        }else{
            if (params.status){
                let tempStatus = (params.status).toString().split(",");
                query.where.status = { in: tempStatus };
                totalCountQuery.where.status = { in: tempStatus };
            }
        }
        if (params.addedFrom) {
            query.where.createdAt = { '>=' : new Date(params.addedFrom).getTime() }
            totalCountQuery.where.createdAt = { '>=' : new Date(params.addedFrom).getTime() }
        }
        if (params.addedTo) {
            query.where.createdAt = { '<=' : new Date(params.addedTo).getTime() }
            totalCountQuery.where.createdAt = { '<=' : new Date(params.addedTo).getTime() }
        }
        query.omit = ['contentSubmitted', 'createdBy', 'updatedBy', 'delete', 'designSubmitted', 'excel_id', 
        'metaSource'];

        let result = [];
        result = await News.find(query);
        for (let i = 0; i < result.length; i++) {
            result[i].categories = result[i].categories_array;
            delete result[i].categories_array;
            let t = result[i];
            if(t.imageId){
                let findImageById = await Images.findOne({ id: t.imageId });
                if(findImageById){
                    let _image_id = _.cloneDeep(findImageById);
                    t.imageSrc = _image_id.imageSrc;
                    t.imageSourceName = _image_id.imageSourceName;
                    delete t.imageId;
                }
            }
        }
        let tilesObj = await News.find({ delete: false, type: '"graphics"' });
        let tiles = {
            publishedCount: _.filter(tilesObj, (t) => {return t.status === "published"}).length,
            scheduledCount: _.filter(tilesObj, (t) => {return t.status === "scheduled"}).length,
            inReviewCount: _.filter(tilesObj, (t) => {return t.status === "in-review"}).length,
            autoScheduledCount: _.filter(tilesObj, (t) => {return t.status === "auto-scheduled"}).length,
            editRequiredCount: _.filter(tilesObj, (t) => {return t.status === "edit-required"}).length,
            rejectedCount: _.filter(tilesObj, (t) => {return t.status === "rejected"}).length
        }
        let totalGraphicsCountInDB = await News.find(totalCountQuery);
        let settings = {
            newsCount: 5,
            graphicsCount: 1
        }
        
        res.send({
            page,
            totalCount: totalGraphicsCountInDB.length,
            total: result.length,
            rows: result,
            tiles,
            settings
        });
    }
}