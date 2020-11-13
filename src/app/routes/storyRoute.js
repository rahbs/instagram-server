module.exports = function(app){
    const story = require('../controllers/storyController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/story').post(jwtMiddleware,story.uploadStory);
    app.delete('/story/:storyId',jwtMiddleware, story.deleteStory);
    app.get('/story/:storyId',jwtMiddleware, story.getStoryDetail);
    app.get('/stories/users',jwtMiddleware, story.getStoryUsers);
    app.get('/story/:storyId/readers',jwtMiddleware, story.getStoryReaders);
};
