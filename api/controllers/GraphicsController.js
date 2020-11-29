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
        query.where = {type: 'graphics', delete: false};

        let totalCountQuery = {}
        totalCountQuery.where = {delete: false, type: 'graphics'}

        if (params.addedFrom) {
            query.where.createdAt = { '>=' : new Date(params.addedFrom).getTime() }
            totalCountQuery.where.createdAt = { '>=' : new Date(params.addedFrom).getTime() }
        }
        if (params.addedTo) {
            query.where.createdAt = { '<=' : new Date(params.addedTo).getTime() }
            totalCountQuery.where.createdAt = { '<=' : new Date(params.addedTo).getTime() }
        }
        query.omit = ['contentSubmitted', 'createdBy', 'updatedBy', 'delete', 'designSubmitted', 'excel_id', 
        'metaSource', 'send_notification'];

        let result = [];
        result = await News.find(query);
        for (let i = 0; i < result.length; i++) {
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
        let tilesObj = await News.find({delete: false,type: 'graphics' });
        let tiles = {
            publishedCount: _.filter(tilesObj, (t) => {return t.status === "published"}).length,
            scheduledCount: _.filter(tilesObj, (t) => {return t.status === "scheduled"}).length,
            inReviewCount: _.filter(tilesObj, (t) => {return t.status === "in-review"}).length,
            autoScheduledCount: _.filter(tilesObj, (t) => {return t.status === "auto-scheduled"}).length,
        }
        let totalGraphicsCountInDB = await News.find(totalCountQuery);
        
        res.send({
            page,
            totalCount: totalGraphicsCountInDB.length,
            total: result.length,
            rows: result,
            tiles
        });
    }
}