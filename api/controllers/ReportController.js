/**
 * ReportController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  

    types : async function (req, res) {
        let result = await ReportType.find().populate('subTypes');
        res.send(result);
    },

    addSubTypesInTypes: async function (req, res) {
        let objReportTypes = await ReportType.find();
        if (objReportTypes.length){
            for (let index = 0; index < objReportTypes.length; index++) {
                const _types = objReportTypes[index];
                switch (_types.id) {
                    case 1:
                        await ReportType.addToCollection(_types.id, 'subTypes', [1, 2, 3]);
                        break;
                    case 2:
                        await ReportType.addToCollection(_types.id, 'subTypes', [4, 5, 6]);
                        break;
                    case 3:
                        await ReportType.addToCollection(_types.id, 'subTypes', [7, 8, 9]);
                        break;
                
                    default:
                        break;
                }
                
            }
        }
        let result = await ReportType.find().populate('subTypes');
        res.send(result);
    }



};

