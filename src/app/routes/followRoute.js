module.exports = function(app){
    const follow = require('../controllers/followController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // app.route('/comment').post(jwtMiddleware, comment.createComment);
    // app.delete('/comment/:commentId', jwtMiddleware ,comment.deleteComment);
    // app.get('/feed/:feedId/comments',jwtMiddleware,comment.selectCommentList);
    app.route('/followRequest').post(jwtMiddleware,follow.requestFollow);
    app.route('/followAccept/:followRequestId').post(jwtMiddleware,follow.acceptFollow);
    app.delete('/followAccept/:followRequestId',jwtMiddleware,follow.refuseFollow);
    app.route('/user/:userIdx/closeFriend').post(jwtMiddleware,follow.setCloseFriend);
};