const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const errorModule = require('../../../modules/error_modules');

const commentDao = require('../dao/commentDao');
const userDao = require('../dao/userDao');
const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

/**
 update : 2020.11.5
 15.Get commentlist API = 댓글조회
 **/
exports.selectCommentList = async function (req, res) {
    const feedID = req.params['feedId'];
    const limitStart = req.query.limitStart;
    const limitCount = req.query.limitCount;

    try {
        const userID = req.verifiedToken.id;
        const selectCommentListParams = [feedID,limitStart,limitCount];
        const [selectCommentByFeedIdRows] = await commentDao.selectCommentByFeedId(selectCommentListParams);
        // const commentUserParams = [feedID];
        const commentUserRows = await commentDao.commentUser(feedID);
        return res.json({
            userFeed : commentUserRows,
            commentList : selectCommentByFeedIdRows,
            isSucess : true, code : 200, message : "댓글 조회 성공"});
    } catch (error) {
        logger.error(`App - selectCommnetList Query error\n: ${JSON.stringify(error)}`);
        connection.release();
            return false;
    }
}
//대댓글 조회 api
exports.selectReCommentList = async function (req, res) {
    const commentId = req.params['commentId'];
    const limitStart = req.query.limitStart;
    const limitCount = req.query.limitCount;

    try {
        const userIdx = req.verifiedToken.id;
        const selectCommentListParams = [commentId,limitStart,limitCount];
        const [selectCommentByFeedIdRows] = await commentDao.selectReCommentByCommentId(commentId,limitStart,limitCount);

        return res.json({
            commentList : selectCommentByFeedIdRows,
            isSucess : true, code : 200, message : "대댓글 조회 성공"});
    } catch (error) {
        logger.error(`App - selectReCommentList Query error\n: ${JSON.stringify(error)}`);
        connection.release();
            return false;
    }
}
/**
 update : 2020.11.5
 16.like feed API = 피드좋아요/취소
 **/
exports.likeFeed = async function (req, res) {
    const feedID = req.params['feedId'];
    try {
        const userIdx = req.verifiedToken.id;
        const likeFeedParams = [userIdx,feedID];
        const likeFeedRows = await commentDao.likeFeed(userIdx,feedID);
        if(likeFeedRows === 'Y') return res.json({like : "Y", isSucess : true, code : 200, message : "좋아요"});
        else if(likeFeedRows === 'N') return res.json({like : "N", isSucess : true, code : 201, message : "좋아요 취소"});
    } catch (error) {
        logger.error(`App - likeFeed Query error\n: ${JSON.stringify(error)}`);
        connection.release();
            return false;
    }
}
/**
 update : 2020.11.5
 17.like comment API = 댓글좋아요/취소
 **/
exports.likeComment = async function (req, res) {
    const commentID = req.params['commentId'];
    try {
        const userIdx = req.verifiedToken.id;
        const likeCommentParams = [userIdx,commentID];
        const likeCommentRows = await commentDao.likeComment(userIdx,commentID);
        if(likeCommentRows === 'Y') {
            return res.json({like : "Y", isSucess : true, code : 200, message : "좋아요"});}
        else if(likeCommentRows === 'N') return res.json({like : "N", isSucess : true, code : 201, message : "좋아요 취소"});
        
    } catch (error) {
        logger.error(`App - likeComment Query error\n: ${JSON.stringify(error)}`);
        connection.release();
            return false;
    }
}
/**
 update : 2020.11.5
 18.Post comment API = 댓글생성
 **/
exports.createComment = async function (req, res) {
    const {
        feedId, comment 
    } = req.body;

    // 댓글 생성시 댓글 목록 바로 업데이트해주는 트랜잭션필요
    try {
        const userIdx = req.verifiedToken.id;
        //const [userIdx] = await userDao.getUserIdxbyId(userId);
        const insertCommentParams = [feedId,userIdx,comment];
        const insertCommmentRows = await commentDao.insertComment(feedId,userIdx,comment);
        return res.json({commentId : insertCommmentRows[0],
            profileImgUrl : insertCommmentRows[1],
            userId : insertCommmentRows[2],
            isSucess : true, code : 200, message : "댓글생성성공"});
    } catch (error) {
        logger.error(`App - InsertComment Query error\n: ${JSON.stringify(error)}`);
        connection.release();
            return false;
    }
}
//대댓글 생성 api
exports.createReComment = async function (req, res) {
    const {
        feedId,commentId, comment 
    } = req.body;

    // 댓글 생성시 댓글 목록 바로 업데이트해주는 트랜잭션필요
    try {
        const userIdx = req.verifiedToken.id;
        //const [userIdx] = await userDao.getUserIdxbyId(userId);
        const insertCommentParams = [feedId,commentId,userIdx,comment];
        const insertCommmentRows = await commentDao.insertreComment(feedId,commentId,userIdx,comment);
        return res.json({commentId : insertCommmentRows[0],
            profileImgUrl : insertCommmentRows[1],
            userId : insertCommmentRows[2],
            isSucess : true, code : 200, message : "대댓글생성성공"});
    } catch (error) {
        //console.log(error);
        logger.error(`App - InsertComment Query error\n: ${JSON.stringify(error)}`);

            return false;
    }
}

/**
 update : 2020.11.5
 19.Delete comment API = 댓글삭제
 **/
exports.deleteComment = async function (req, res) {
    const commentId = req.params['commentId'];
    const activityId = req.query.activityId;
    // 댓글 삭제시 댓글 목록 바로 업데이트해주는 트랜잭션필요
    try {
        
        const userId = req.verifiedToken.id;
        const [userIdx] = await userDao.getUserIdxbyId(userId);

        const [selectCommentRows] = await commentDao.selectComment(commentId);
        if(!selectCommentRows) return res.json({isSucess : false, code : 320, message : "존재하지 않는 댓글입니다."});
        const [selectCommentIsDeletedRows] = await commentDao.selectCommentIsDeleted(commentId);
        if(!selectCommentIsDeletedRows) return res.json({isSucess : false, code : 320, message : "존재하지 않는 댓글입니다."});

        const deleteCommentParams = [commentId,activityId];
        const deleteCommmentRows = await commentDao.deleteComment(commentId,activityId);
        return res.json({isSucess : true, code : 200, message : "댓글 삭제 성공"});
    } catch (error) {
        logger.error(`App - DeleteComment Query error\n: ${JSON.stringify(error)}`);
        connection.release();
            return false;
    }
}
