module.exports = function(app){
    const index = require('../controllers/indexController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/', index.test);
    app.get('/test', index.test);
    
    app.get('/signIn/auto', jwtMiddleware, index.test);

};
