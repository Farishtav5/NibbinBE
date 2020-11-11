/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { view: 'pages/homepage' },
  "get /news": "NewsController.list",
  "get /news/:id": 'NewsController.get',
  "get /news/:id/prev-next": 'NewsController.prevNextNews',
  "get /news/status-list": 'NewsController.newsStatusList',

  "post /news": "NewsController.create",
  "put /news/:id": "NewsController.update",
  "delete /news/:id": "NewsController.delete",
  "put /news/image-from-gallery/:id": "NewsController.updateNewsImageByPickFromGallery",
  "get /reset-news": "NewsController.restAllNewsData", //will remove it later
  "get /covid": "NewsController.findCovid19", //will remove it later
  "get /go": "NewsController.demoFetch", //will remove it later
  
  
  "get /preview": "NewsController.previewSourceLink", //will remove it later
  
  "post /news/:newsId/report": "NewsController.reportNewsByUser",

  "get /news/:id/report" : "ReportController.singleNews",
  
  "get /report/types" : "ReportController.types",

  "get /report/demo/addsubtypes": "ReportController.addSubTypesInTypes", //will remove it later

  //for dashboard
  "get /report" : "ReportController.list",
  "get /report/:id" : "ReportController.get",

  "get /categories": "CategoryController.list",
  "post /categories": "CategoryController.create",
  "put /categories/:id" : "CategoryController.update",
  "delete /categories/:id" : "CategoryController.delete",


  'post /login': 'AuthController.login',
  "get /users": "UserController.getAllUsersList",
  "get /users/:id": "UserController.get",
  "get /user/profile": "UserController.getMyProfile",
  "put /user/profile": "UserController.updateMyProfile",
  "post /users/create": "UserController.create",
  "put /users/:id": "UserController.updateUserDetail",
  "delete /users/:id": "UserController.delete",
  
  "post /users/categories": "UserController.setUserInterestCategories",
  
  'post /verify-token/:token': 'AuthController.verifyGoogleLogin',
  'post /login-apple': 'AuthController.loginWithAppleId',


  'get /bookmarks': 'BookmarkController.getAllBookmarkByUserId',
  'post /addbookmark': 'BookmarkController.addBookmarksByUser',
  'delete /removebookmark/:bookmarkId': 'BookmarkController.removeBookmarkByUser',

  //Roles
  'get /roles': 'RolesController.getAllRoles',
  'post /role': 'RolesController.createNewRole',
  'put /role/:roleId': 'RolesController.updateRole',
  'delete /role/:roleId': 'RolesController.deleteRole',
  
  //Comment
  'post /comment': 'CommentsController.createNewComment',

  //image upload
  'post /upload': 'ImageController.uploadFile',
  'put /upload/:id': 'ImageController.updateImageInGallery',


  // 'get /excel': { view: 'pages/excelupload' },
  'get /gallery': 'ImageController.getAllImagesForGallery',
  
  'get /excel': 'ImageController.showExcelPage',
  'post /excel': 'ImageController.uploadExcel',
  'get /scrap': 'ImageController.scrapImageUrl',

  //website API
  "get /web/news": "WebsiteController.list",
  "get /web/news/:id": "WebsiteController.getSingleNews",

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
