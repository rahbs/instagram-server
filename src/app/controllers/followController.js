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
 20.followRequest API = 팔로우
 **/
exports.requestFollow = async function (req,res) {
    const {followUserIdx} = req.body;

    try {
        const userIdx = req.verifiedToken.id;
        const [isPrivateUser] = await userDao.isPrivateUserIdx(followUserIdx);
        const requestFollowParams = [userIdx,followUserIdx];
        //비공개 유저인 경우
        if(isPrivateUser[0].exist === 1){
            const requestFollowPrivateUser = await followDao.requestFollowPrivateUser(requestFollowParams);
            if(requestFollowPrivateUser === 'N') return res.json({follow : "N", isSucess : true, code : 201, message : "팔로우 취소"});
            else return res.json({followId : requestFollowPrivateUser, isSucess : true, code : 200, message : "팔로우 요청"});

        }
        else if(isPrivateUser[0].exist ===0) {
            const requestFollowRows = await followDao.requestFollow(requestFollowParams);
            if(requestFollowRows === 'Y') return res.json({follow : "팔로잉",isSucess : true, code :200, message : "팔로우 성공"});
        }

    } catch (error) {
        logger.error(`App - requestFollow Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}