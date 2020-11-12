const { addColors } = require('winston/lib/winston/config');

module.exports = function(app){
    const comment = require('../controllers/commentController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //app.route('/signIn').post(user.signIn);

    //app.get('/check', jwtMiddleware, user.check);
    app.get('/feed/:feedId/comments',jwtMiddleware,comment.selectCommentList);
    app.get('/comment/:commentId/recomment',jwtMiddleware,comment.selectReCommentList);
    app.route('/comment').post(jwtMiddleware, comment.createComment);
    app.route('/comment/recomment').post(jwtMiddleware, comment.createReComment);
    app.delete('/comment/:commentId', jwtMiddleware ,comment.deleteComment);
    app.get('/feed/:feedId/comments',jwtMiddleware,comment.selectCommentList);
    app.route('/comment/:commentId/like').post(jwtMiddleware,comment.likeComment);
    app.route('/feed/:feedId/like').post(jwtMiddleware,comment.likeFeed);
};