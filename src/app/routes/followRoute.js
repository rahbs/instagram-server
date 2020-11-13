module.exports = function(app){
    const follow = require('../controllers/followController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    
    app.route('/followRequest').post(jwtMiddleware,follow.requestFollow);
    app.get('/user/follow',jwtMiddleware,follow.followList);
    app.route('/followAccept/:followRequestId').post(jwtMiddleware,follow.acceptFollow);
    app.delete('/followAccept/:followRequestId',jwtMiddleware,follow.refuseFollow);
    app.route('/user/:userIdx/closeFriend').post(jwtMiddleware,follow.setCloseFriend);
    app.route('/user/:userIdx/mute').post(jwtMiddleware,follow.hideFeedOrStory);
    app.delete('/user/:userIdx/following',jwtMiddleware,follow.cancelFollowing);
    app.delete('/user/:userIdx/follower',jwtMiddleware,follow.cancelFollower);
    app.route('/user/:userIdx/block').post(jwtMiddleware,follow.userBlock);
    app.get('/users/notFollowingUser',jwtMiddleware,follow.notFollowingUserList);
};