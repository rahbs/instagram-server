const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const errorModule = require('../../../modules/error_modules');

const followDao = require('../dao/followDao');
const userDao = require('../dao/userDao');
const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');
const { isPrivateUserIdx } = require('../dao/userDao');

/**
 update : 2020.11.6
 20.followRequest API = 팔로우요청
 **/
exports.requestFollow = async function (req,res) {
    const {followUserIdx} = req.body;

    try {
        const userIdx = req.verifiedToken.id;
        const [isPrivateUser] = await userDao.isPrivateUserIdx(followUserIdx);
        //비공개 유저인 경우
        if(isPrivateUser[0].exist === 1){

        }
        else if(isPrivateUser[0].exist ===0) {
            const requestFollowParams = [userIdx,followUserIdx];
            const requestFollowRows = await followDao.requestFollow(requestFollowParams);
        
            if(requestFollowRows === 'Y') return res.json({follow : "Y",isSucess : true, code :200, message : "팔로우 성공"});
            else if(requestFollowRows === 'N') return res.json({lfollow : "N", isSucess : true, code : 201, message : "팔로우 취소"});
            
        }

    } catch (error) {
        logger.error(`App - likeFeed Query error\n: ${JSON.stringify(error)}`);
        return false;
    }
}