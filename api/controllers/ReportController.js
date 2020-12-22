/**
 * ReportController
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
        query.where = {};
        let totalCountQuery = {where: {}}
        
        if (params.status) {
            query.where.status = { in: params.status };
            totalCountQuery.where.status = { in: params.status };
        }
        if (params.typeId) {
            query.where.typeId = { in: params.typeId };
            totalCountQuery.where.typeId = { in: params.typeId };
        }
        if (params.subTypeId) {
            query.where.subTypeId = { in: params.subTypeId };
            totalCountQuery.where.subTypeId = { in: params.subTypeId };
        }
        if (params.addedFrom) {
            query.where.createdAt = { '>=' : new Date(params.addedFrom).getTime() }
            totalCountQuery.where.createdAt = { '>=' : new Date(params.addedFrom).getTime() }
        }
        if (params.addedTo) {
            query.where.createdAt = { '<=' : new Date(params.addedTo).getTime() }
            totalCountQuery.where.createdAt = { '<=' : new Date(params.addedTo).getTime() }
        }
        
        let result = await ReportByUser.find(query).populate('typeId').populate('subTypeId').populate('newsId').usingConnection(sails.config.db);
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
            for(let i=0; i < resultWithImgObj.length; i++) {
                if(resultWithImgObj[i] && resultWithImgObj[i].newsId && resultWithImgObj[i].newsId.imageId){
                    let _image_id = _.cloneDeep(resultWithImgObj[i].newsId.imageId);
                    resultWithImgObj[i].imageSrc = _image_id.imageSrc;
                    resultWithImgObj[i].imageSourceName = _image_id.imageSourceName;
                    resultWithImgObj[i].imageId = _image_id.id;
                }
            }
        };
        let totalReportCountInDB = await ReportByUser.find(totalCountQuery).usingConnection(sails.config.db);
        res.send({
            page,
            totalCount: totalReportCountInDB.length,
            perPage: resultWithImgObj.length,
            rows: resultWithImgObj
        });
    },

    get: async function (req, res) {
        let params = req.allParams();
        let result = await ReportByUser.findOne({id: params.id}).populate('typeId').populate('subTypeId').populate('newsId').populate('userId').usingConnection(sails.config.db);
        let resultWithImgObj = {}
        if(result) {
            resultWithImgObj = await nestedPop.nestedPop(result, {
                newsId: {
                as: 'News',
                populate: [
                    'imageId', 'categories'
                ]
                }
            });
            
            if(resultWithImgObj && resultWithImgObj.newsId && resultWithImgObj.newsId.imageId){
                let _image_id = _.cloneDeep(resultWithImgObj.newsId.imageId);
                resultWithImgObj.imageSrc = _image_id.imageSrc;
                resultWithImgObj.imageSourceName = _image_id.imageSourceName;
                resultWithImgObj.imageId = _image_id.id;
            }
        }
        res.send({ 
            data: resultWithImgObj,
            device: result.device
        });
    },

    update: async function (req, res) {
        let params = req.allParams();
        if (!params.id) {
            return ResponseService.json(400, res, "please provide news id");
        }
       
        let findReport = await ReportByUser.find({ id:  params.id}).usingConnection(sails.config.db);
        if(!findReport){
            return ResponseService.json(404, res, "news not found");
        }
        let objUpdate = {}
        if(params.status){
            objUpdate.status = params.status;
        }
        let result = await ReportByUser.updateOne({
            id: params.id
        }).set(objUpdate).usingConnection(sails.config.db);
        res.send(result);
    },

    types : async function (req, res) {
        let result = await ReportType.find().populate('subTypes').usingConnection(sails.config.db);
        res.send(result);
    },

    addSubTypesInTypes: async function (req, res) {
        let objReportTypes = await ReportType.find().usingConnection(sails.config.db);
        if (objReportTypes.length){
            for (let index = 0; index < objReportTypes.length; index++) {
                const _types = objReportTypes[index];
                switch (_types.id) {
                    case 1:
                        await ReportType.addToCollection(_types.id, 'subTypes', [1, 2, 3]).usingConnection(sails.config.db);
                        break;
                    case 2:
                        await ReportType.addToCollection(_types.id, 'subTypes', [4, 5, 6]).usingConnection(sails.config.db);
                        break;
                    case 3:
                        await ReportType.addToCollection(_types.id, 'subTypes', [7, 8, 9]).usingConnection(sails.config.db);
                        break;
                
                    default:
                        break;
                }
                
            }
        }
        let result = await ReportType.find().populate('subTypes').usingConnection(sails.config.db);
        res.send(result);
    }



};

