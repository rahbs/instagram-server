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
 update : 2020.11.10
 21.followList API = 팔로잉/팔로워 리스트 조회
 **/
exports.followList = async function (req,res) {
    try {
        const userIdx = req.verifiedToken.id;
        const followType = req.query.follow;
        if(followType === "follower"){
            const [followListRows] = await followDao.followList(userIdx,followType);
            return res.json({
                result : followListRows,
                isSucess : true, code : 200, message : "팔로워 목록 조회"
            });
        }else if(followType === "following"){
            const [followListRows] = await followDao.followList(userIdx,followType);
            return res.json({
                result : followListRows,
                isSucess : true, code : 201, message : "팔로잉 목록 조회"
            });
        }else{
            return res.json({
                isSucess : false, code : 400, message : "없는 옵션입니다."
            });
        }
    } catch (error) {
        logger.error(`App - followList Query error\n: ${JSON.stringify(error)}`);
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
            //console.log(acceptFollowRows);
            if(acceptFollowRows.length<1){
                return res.json({isSucess : false, code :400, message : "요청이 없습니다."});
            }
        
            return res.json({follow : "팔로잉" ,isSucess : true, code :200, message : "팔로우 요청 수락"});
        }
        else{
            return res.json({isSucess : false, code :402, message : "권한이 없습니다."});
        }
        

    } catch (error) {
        logger.error(`App - acceptFollow Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}
/**
 update : 2020.11.8
 23. refuseFollowRequest API = 팔로우 요청거절
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
/**
 update : 2020.11.8
 24. setCloseFriend API = 친한 친구 설정
 **/
exports.setCloseFriend = async function (req,res) {
    const userId = req.params['userIdx'];
    try {
        const userIdx = req.verifiedToken.id;
        const isValidFollowParams = [userIdx,userId];
        const isValidFollowRows = await followDao.isValidFollow(isValidFollowParams);
        if(isValidFollowRows === 0){
            return res.json({isSucess : false, code : 300, message : "팔로워가 아닌 유저입니다."});
        }
        else{
            if(isValidFollowParams[0] === userIdx){
                const setCloseFriendParams = [userIdx,userId];
                const setCloseFriendRows = await followDao.setCloseFriend(setCloseFriendParams);
                if(setCloseFriendRows === 'N'){
                    return res.json({isSucess : true, code : 201, message : "친한 친구 설정 취소"})
                }
                return res.json({isSucess : true, code : 200, message : "친한 친구 설정 성공"});
            }
            else{
                return res.json({isSucess : false, code : 402, message : "권한이 없습니다."})
            }
        }

    } catch (error) {
        logger.error(`App - setCloseFriend Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}
/**
 update : 2020.11.9
 25. hideFeedOrStory API = 피드/스토리 숨김
 **/
exports.hideFeedOrStory = async function (req,res) {
    const userId = req.params['userIdx'];
    const kind = req.query.kind;
    try {
        const userIdx = req.verifiedToken.id;
        const isValidFollowParams = [userIdx,userId];
        const isValidFollowRows = await followDao.isValidFollow(isValidFollowParams);
        if(isValidFollowRows === 0){
            return res.json({isSucess : false, code : 300, message : "팔로워가 아닌 유저입니다."});
        }
        else{
            if(isValidFollowParams[0] === userIdx){
                const hideFeedOrStoryParams = [kind,userIdx,userId];
                const hideFeedOrStoryRows = await followDao.hideFeedOrStory(kind,userIdx,userId);
                if(hideFeedOrStoryRows === 'SY'){
                    return res.json({isSucess : true, code : 210, message : "스토리 숨김 설정 성공"})
                }
                else if(hideFeedOrStoryRows === 'SN'){
                    return res.json({isSucess : true, code : 211, message : "스토리 숨김 설정 취소"})
                }
                else if(hideFeedOrStoryRows === 'FY'){
                    return res.json({isSucess : true, code : 200, message : "피드 숨김 설정 성공"});
                }
                else if(hideFeedOrStoryRows === 'FN'){
                    return res.json({isSucess : true, code : 201, message : "피드 숨김 설정 취소"});
                }
                else{
                    return res.json({isSucess : false, code : 301, message : "유효하지 않은 쿼리스트링입니다."});
                }
                
            }
            else{
                return res.json({isSucess : false, code : 402, message : "권한이 없습니다."})
            }
        }

    } catch (error) {
        logger.error(`App - hideFeedOrStory Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}
/**
 update : 2020.11.9
 26. cancelFollowing API = 팔로잉 취소
 **/
exports.cancelFollowing = async function (req,res) {
    const userId = req.params['userIdx'];
    try {
        const userIdx = req.verifiedToken.id;
        const isValidFollowParams = [userId,userIdx];
        const isValidFollowRows = await followDao.isValidFollow(isValidFollowParams);
        if(isValidFollowRows === 0){
            return res.json({isSucess : false, code : 300, message : "팔로우 상태가 아닌 유저입니다."});
        }
        else{
            if(isValidFollowParams[0] === userId){
                const cancelFollowingParams = [userId,userIdx];
                const cancelFollowingRows = await followDao.cancelFollowing(cancelFollowingParams);
                return res.json({isSucess : true, code : 200, message : "팔로잉 취소"})
                
            }
            else{
                return res.json({isSucess : false, code : 402, message : "권한이 없습니다."})
            }
        }

    } catch (error) {
        logger.error(`App - cancelFollowing Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}
/**
 update : 2020.11.9
 27. cancelFollower API = 팔로워 삭제
 **/
exports.cancelFollower = async function (req,res) {
    const userId = req.params['userIdx'];
    try {
        const userIdx = req.verifiedToken.id;
        const isValidFollowParams = [userId,userIdx];
        const isValidFollowRows = await followDao.isValidFollow(isValidFollowParams);
        if(isValidFollowRows === 0){
            return res.json({isSucess : false, code : 300, message : "팔로우 상태가 아닌 유저입니다."});
        }
        else{
            if(isValidFollowParams[0] === userId){
                const cancelFollowerParams = [userIdx,userId];
                const cancelFollowerRows = await followDao.cancelFollower(cancelFollowerParams);
                return res.json({isSucess : true, code : 200, message : "팔로워 삭제"})
                
            }
            else{
                return res.json({isSucess : false, code : 402, message : "권한이 없습니다."})
            }
        }

    } catch (error) {
        logger.error(`App - cancelFollower Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}
/**
 update : 2020.11.9
 28. userBlock API = 차단
 **/
exports.userBlock = async function (req,res) {
    const userId = req.params['userIdx'];
    try {
        const userIdx = req.verifiedToken.id;
        const isValidFollowParams = [userIdx,userId];
        const isValidFollowRows = await followDao.isValidFollow(isValidFollowParams);
        if(isValidFollowRows === 0){
            return res.json({isSucess : false, code : 300, message : "팔로우 상태가 아닌 유저입니다."});
        }
        else{
            if(isValidFollowParams[0] === userIdx){
                const userBlockParams = [userIdx,userId];
                const userBlockRows = await followDao.userBlock(userBlockParams);
                if(userBlockRows === 'Y'){
                    return res.json({isSucess : true, code : 200, message : "차단"});
                }
                else if(userBlockRows === 'N'){
                    return res.json({isSucess : true, code : 201, message : "차단 취소"});
                }
                
            }
            else{
                return res.json({isSucess : false, code : 402, message : "권한이 없습니다."})
            }
        }
    } catch (error) {
        logger.error(`App - userBlock Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}
/**
 update : 2020.11.10
 29. notFollowingUserList API = 맞팔로우하지 않은 유저 리스트
 **/
exports.notFollowingUserList = async function (req,res) {
    try {
        const userIdx = req.verifiedToken.id;
        
        const [notFollowingUserListRows] = await followDao.notFollowingUserList(userIdx);
        return res.json({
            result : notFollowingUserListRows,
            isSucess : true, code : 200, message : "맞팔로우하지 않은 유저 조회 성공"
        });
       
    } catch (error) {
        logger.error(`App - userBlock Query error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}