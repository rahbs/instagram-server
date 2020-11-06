module.exports = function(app){
    const comment = require('../controllers/commentController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //app.route('/signIn').post(user.signIn);

    //app.get('/check', jwtMiddleware, user.check);
    app.route('/comment').post(jwtMiddleware, comment.createComment);
    app.delete('/comment/:commentId', jwtMiddleware ,comment.deleteComment);
    app.get('/feed/:feedId/comments',jwtMiddleware,comment.selectCommentList);
    app.route('/comment/:commentId/like').post(jwtMiddleware,comment.likeComment);
    app.route('/feed/:feedId/like').post(jwtMiddleware,comment.likeFeed);
};