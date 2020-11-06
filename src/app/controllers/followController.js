const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const errorModule = require('../../../modules/error_modules');

const followDao = require('../dao/followDao');
const userDao = require('../dao/userDao');
const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

exports.requestFollow = async function (req,res) {

    try {
        const userIdx = req.verifiedToken.id;
        const requestFollowParams = [];
        const requestFollowRows = await followDao.requestFollow(requestFollowParams);

    } catch (error) {
        logger.error(`App - likeFeed Query error\n: ${JSON.stringify(error)}`);
        return false;
    }
}


// exports.likeFeed = async function (req, res) {
//     const feedID = req.params['feedId'];
//     try {
//         const userIdx = req.verifiedToken.id;
//         const likeFeedParams = [userIdx,feedID];
//         const likeFeedRows = await commentDao.likeFeed(likeFeedParams);
//         if(likeFeedRows === 'Y') return res.json({like : "Y", isSucess : true, code : 200, message : "좋아요"});
//         else if(likeFeedRows === 'N') return res.json({like : "N", isSucess : true, code : 201, message : "좋아요 취소"});
//     } catch (error) {
//         logger.error(`App - likeFeed Query error\n: ${JSON.stringify(error)}`);

//             return false;
//     }
// }