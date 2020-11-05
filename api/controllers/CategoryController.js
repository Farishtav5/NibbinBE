/**
 * CategoryController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    list: async (req, res) => {
        let result = await Category.find();
        res.send({
            rows: result
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
        let result = await Category.create().fetch();
        res.send(result);
    },
    
    update: async (req, res) => {
        let params = req.allParams();

        if(!params.id){
            return ResponseService.json(400, res, "pass id");
        }

        let findCategoryById = await Category.findOne({id: params.id});
        if(findCategoryById){
            let data = {};
            if(params.name) data.name = params.name;
            if(params.description) data.description = params.description;
            let result = await Category.updateOne({id: params.id}).set(data);
            res.send(result);
        }else{
            return ResponseService.json(400, res, "category not found");
        }

    }
};

