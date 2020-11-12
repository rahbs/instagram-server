module.exports = function(app){
    const activity = require('../controllers/activityController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //app.route('/signIn').post(user.signIn);

    //app.get('/check', jwtMiddleware, user.check);
    app.get('/activities',jwtMiddleware,activity.selectActivity);
    
};