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
  "post /news": "NewsController.create",
  "put /news/:id": "NewsController.update",
  "delete /news/:id": "NewsController.delete",
  "post /news/:id/report" : "ReportController.create",
  "get /news/:id/report" : "ReportController.singleNews",
  
  "get /report/types" : "ReportController.types",
  "get /report" : "ReportController.list",
  "get /report/:id" : "ReportController.get",

  "get /categories": "CategoryController.list",
  "post /categories": "CategoryController.create",
  "put /categories/:id" : "CategoryController.update",
  "delete /categories/:id" : "CategoryController.delete",


  'post /login': 'AuthController.login',
  "get /users": "UserController.list",
  "get /users/:id": "UserController.get",
  "post /users/create": "UserController.create",
  "put /users/:id": "UserController.update",
  "delete /users/:id": "UserController.delete",
  
  "post /users/categories" : "UserController.setCategories",
  
  'post /verify-token/:token': 'AuthController.verifyGoogleLogin',

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
