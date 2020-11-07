module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //app.route('/app/signUp').post(user.signUpTemplate);
    app.get('/check', jwtMiddleware, user.check);
    app.route('/signIn').post(user.signIn);
    app.route('/signUp').post(user.signUp);
    
    app.get('/userInfo', jwtMiddleware, user.getUserInfo);
    app.patch('/userInfo', jwtMiddleware, user.modifyUserInfo);

    app.get('/accountType', jwtMiddleware, user.getAccountType);
    app.route('/accountType').post(jwtMiddleware,user.changeAccaountType);

};
