module.exports = function(app){
    const index = require('../controllers/indexController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app', jwtMiddleware, index.default);
    app.get('/', index.test);
    app.get('/test', index.test);
    app.get('/testJWT', jwtMiddleware, index.test);
};
