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
    'prevNextNews': ['openAuthorized'],
    'reportNewsByUser': ['openAuthorized'],
    'restAllNewsData': ['openAuthorized'],
    'findCovid19': ['openAuthorized'],
    'demoNotifyFirebase': ['openAuthorized'],
    'demoFetch': ['openAuthorized'],
    'addNews': ['openAuthorized'],
    
    'previewSourceLink': true,
  },
  CategoryController: {
    '*': ['isAuthorized'],
    'list': true
  },
  ReportController: {
    '*': ['isAuthorized'],
    'types': true,
    'addSubTypesInTypes': true,
    'list': ['openAuthorized'],
    'get': ['openAuthorized'],
  },
  BookmarkController: {
    '*': ['isAuthorized'],
  },
  RolesController: {
    '*': ['isAuthorized'],
  },
  CommentsController: {
    '*': ['isAuthorized'],
  },
  ImageController: {
    '*': ['isAuthorized'],
    // '*': true,
  },
  WebsiteController: {
    '*': true,
  },
  GraphicsController: {
    '*': ['isAuthorized'],
    'list': ['openAuthorized']
  },

};
