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
        // let sorted = 'dated DESC';
        let shortBy = (params && params.shortBy) ? params.shortBy : 'updatedAt';
        let orderBy = (params && params.orderBy) ? params.orderBy : 'DESC';

        let query = { skip: skip, limit: limit, sort: shortBy + ' ' + orderBy};
        query.where = {};
        query.where.status = { in: ["published"] }
        
        let tempCategories = [];
        if (params.categories){
            tempCategories = (params.categories).toString().replace(/,(\s+)?$/, '').split(",");
            for (a in tempCategories) {
                tempCategories[a] = parseInt(tempCategories[a], 10);
            }
        }

        let tempCategoriesStrings = [];
        let queryWithOr_for_category = [];
        if(tempCategories.length){
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
                ],
                status: { in: ["published"] } 
            };
        }
        query.where.delete = false;
        query.omit = ['contentSubmitted', 'createdBy', 'updatedBy', 'delete', 'designSubmitted', 'excel_id', 
        'metaSource', 'publishedAt', 'scheduledTo', 'send_notification'];

        let result = [];
        result = await News.find(query)//.populate('imageId');
        for (let i = 0; i < result.length; i++) {
            let t = result[i];
            t.categories = t.categories_array;
            delete t.categories_array;
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

        res.send({
            page,
            rows: result
        });
    },

    getSingleNews: async function (req, res) {
        let params = req.allParams();
        if(params && params.id){
            let result = await News.findOne({ id: params.id }).populate("categories", {select : ['id', 'name'] }).populate('imageId');
            if(result){
                if(result.imageId && result.imageId.imageSrc){
                    result.imageSrc = result.imageId.imageSrc ? result.imageId.imageSrc : '';
                    result.imageSourceName = result.imageId.imageSourceName ? result.imageId.imageSourceName : '';
                    delete result.imageId;
                }
                res.send(result);
            }else{
                return ResponseService.json(404, res, "news not found");
            }
        }else{
            return ResponseService.json(400, res, "provide news id");
        }
        
    },
  

};

