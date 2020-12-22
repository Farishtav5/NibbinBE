/**
 * CategoryController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    list: async (req, res) => {
        let params = req.allParams();
        let page = params.page == undefined ? 1 : parseInt(params.page);
        let limit = params.limit == undefined ? 10 : parseInt(params.limit);
        let skip = (page - 1) * limit;
        // let sorted = 'dated DESC';
        let shortBy = (params && params.shortBy) ? params.shortBy : 'createdAt';
        let orderBy = (params && params.orderBy) ? params.orderBy : 'DESC';
        let query = { skip: skip, limit: limit, sort: shortBy + ' ' + orderBy};
        query.where = {};

        if(params.name){
            query.where.name = { contains: params.name };
        }

        let _queryClone = _.omit(query, ['limit', 'skip', 'sort']);

        let result = await Category.find(query).usingConnection(sails.config.db);
        let totalCount = await Category.count(_queryClone).usingConnection(sails.config.db);
        res.send({
            rows: result,
            total: totalCount
        });
    },

    create: async (req, res) => {
        let params = req.allParams();

        if(!params.name || !params.description){
            return ResponseService.json(400, res, "error");
        }

        let data = {
            name: params.name,
            description: params.description
        }
        let result = await Category.create(data).fetch().usingConnection(sails.config.db);
        res.send(result);
    },
    
    update: async (req, res) => {
        let params = req.allParams();

        if(!params.id){
            return ResponseService.json(400, res, "pass id");
        }

        let findCategoryById = await Category.findOne({id: params.id}).usingConnection(sails.config.db);
        if(findCategoryById){
            let data = {};
            if(params.name) data.name = params.name;
            if(params.description) data.description = params.description;
            let result = await Category.updateOne({id: params.id}).set(data).usingConnection(sails.config.db);
            res.send(result);
        }else{
            return ResponseService.json(400, res, "category not found");
        }

    }
};

