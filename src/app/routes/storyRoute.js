module.exports = function(app){
    const story = require('../controllers/storyController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/story').post(jwtMiddleware,story.uploadStory);
 
};
