module.exports = function(app){
    const comment = require('../controllers/commentController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //app.route('/signIn').post(user.signIn);

    //app.get('/check', jwtMiddleware, user.check);
    app.route('/comment').post(comment.createComment); //post할때 jwt검사는 어떻게?


};