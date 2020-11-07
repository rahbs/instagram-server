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
            else return res.json({followRequestId : requestFollowPrivateUser, isSucess : true, code : 202, message : "팔로우 요청"});

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

/**
 update : 2020.11.7
 22.accept followRequest API = 팔로우 요청수락
 **/
exports.acceptFollow = async function (req,res) {
    const followRequestId = req.params['followRequestId'];
    try {
        const userIdx = req.verifiedToken.id;
        const acceptFollowParams = [followRequestId];
        const selectRequestFollowbyUserIdRows = await followDao.selectRequestFollowbyUserId(acceptFollowParams);
        if(userIdx === selectRequestFollowbyUserIdRows){
            const acceptFollowRows = await followDao.acceptFollow(acceptFollowParams);
            if(acceptFollowRows.length<1){
                return res.json({isSucess : false, code :400, message : "요청이 없습니다."});
            }
        
            return res.json({follow : "팔로잉" ,isSucess : true, code :200, message : "팔로우 요청 수락"});
        }
        else{
            return res.json({isSucess : false, code :400, message : "권한이 없습니다."});
        }
        

    } catch (error) {
        logger.error(`App - acceptFollow Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}
/**
 update : 2020.11.8
 22. refuseFollowRequest API = 팔로우 요청거절
 **/
exports.refuseFollow = async function (req,res) {
    const followRequestId = req.params['followRequestId'];
    try {
        const userIdx = req.verifiedToken.id;
        const refuseFollowParams = [followRequestId];
        const selectRequestFollowbyUserIdRows = await followDao.selectRequestFollowbyUserId(refuseFollowParams);
        if(userIdx === selectRequestFollowbyUserIdRows){
            const refuseFollowRows = await followDao.refuseFollow(refuseFollowParams);
            if(refuseFollowRows.length<1){
                return res.json({isSucess : false, code :300, message : "요청이 없습니다."});
            }
        
            return res.json({follow : "refuse" ,isSucess : true, code :200, message : "팔로우 요청 거절"});
        }
        else{
            return res.json({isSucess : false, code :400, message : "권한이 없습니다."});
        }
        

    } catch (error) {
        logger.error(`App - refuseFollow Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}