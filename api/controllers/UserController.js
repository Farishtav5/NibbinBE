/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
  
    get: async function(req, res){
        let id = req.param('id');
        let result = await User.find({id:id}).populate('categories');
        res.send(result);
    },

    bind: async function (req, res) {
        let result = await User.addToCollection(1, 'categories', [1,2,3]);
        res.send(result);
    }

};

