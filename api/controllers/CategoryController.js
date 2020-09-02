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
    }
};

