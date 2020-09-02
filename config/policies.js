/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,
  '*': false,

  AuthController: {
    '*': true
  },
  UserController: {
    '*': ['isAuthorized'],
  },
  NewsController: {
    '*': ['isAuthorized'],
    'list': ['openAuthorized'],
    'get': ['openAuthorized'],
    'reportNewsByUser': ['openAuthorized'],
    'restAllNewsData': ['openAuthorized'],
  },
  CategoryController: {
    '*': ['isAuthorized'],
    'list': true
  },
  ReportController: {
    '*': ['isAuthorized'],
    'types': true,
    'addSubTypesInTypes': true,
  },

};
