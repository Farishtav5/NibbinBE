/**
 * NewsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    get: async (req, res) => {
        let params = req.allParams();
        let page = params.page == undefined ? 1 : parseInt(params.page);
        let limit = params.limit == undefined ? 10 : parseInt(params.limit);
        let skip = (page - 1) * limit;
        let result = await News.find({skip, limit}).populate("categories").populate("createdBy");
        res.send({
            page,
            rows: result
        });
    },

    bind: async (req, res) => {
        let result = await News.addToCollection(1, 'categories', 3);
        res.send(result);
    },

    create: async (req, res) => {
        let params = req.allParams();        
        let result = await News.create({
            title: params.title,
            shortDesc: params.shortDesc,
            status: "in-queue",
            category: [1,2],
            createdBy: params.createdBy,
            updatedBy: params.updatedBy,
        }).fetch();

        res.send(result);
    }

};

