module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //app.route('/app/signUp').post(user.signUpTemplate);
    app.get('/check', jwtMiddleware, user.check);
    app.route('/signIn').post(user.signIn);
    app.route('/signUp').post(user.signUp);
    
    app.get('/user', jwtMiddleware, user.getUserInfo);
};
