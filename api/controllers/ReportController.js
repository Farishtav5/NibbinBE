/**
 * ReportController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  

    types : async function (req, res) {
        let result = await ReportType.find();
        res.send(result);
    },



};

