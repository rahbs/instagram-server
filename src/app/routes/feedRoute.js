module.exports = function(app){
    const feed = require('../controllers/feedController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    app.route('/feed').post(jwtMiddleware, feed.uploadFeed);
    //app.get('/feeds', jwtMiddleware, feed.getFeeds)
};