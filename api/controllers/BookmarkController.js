/**
 * BookmarkController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getAllBookmarkByUserId: async function (req, res) {
        let params = req.allParams();
        if (req.currentUser && req.currentUser.id) {
            let bookmarksResult = Bookmark.find({
                userId: req.currentUser.id
            }).intercept('UsageError', (err) => {
                err.message = 'Uh oh: ' + err.message;
                return ResponseService.json(400, res, err);
            });
            return ResponseService.json(200, res, "get bookmarks successfully", bookmarksResult);
        }else{
            return ResponseService.json(400, res, "plz provide user");
        }
    },

    addBookmarksByUser: async function (req, res) {
        let params = req.allParams();
        let createdBookmarks = await Bookmark.create({
            newsId: params.newsId,
            // Set the User's Primary Key to associate the Pet with the User.
            userId: req.currentUser.id
        }).usingConnection(sails.config.db);
        return ResponseService.json(200, res, "updated bookmarks successfully", createdBookmarks);
    },

    removeBookmarkByUser: async function (req, res) {
        let params = req.allParams();
        // temp = (params.bookmarkId).toString().split(",");
        // for (a in temp) {
        //     temp[a] = parseInt(temp[a], 10);
        // }
        let removedBookMarks = await User.removeFromCollection(req.currentUser.id, 'bookmarks')
            .members([params.bookmarkId]).usingConnection(sails.config.db);
        return ResponseService.json(200, res, "removed bookmarks successfully", removedBookMarks);
    }
    // updateBookmarksByUserId: async function (req, res) {
    //     let params = req.allParams();
    //     if (req.currentUser && req.currentUser.id) {
    //         let bookmarksResult = Bookmark.find({
    //             userId: req.currentUser.id
    //         }).intercept('UsageError', (err) => {
    //             err.message = 'Uh oh: ' + err.message;
    //             return ResponseService.json(400, res, err);
    //         });
    //         return ResponseService.json(200, res, "get bookmarks successfully", bookmarksResult);
    //     }else{
    //         return ResponseService.json(400, res, "plz provide user");
    //     }

    // }

}