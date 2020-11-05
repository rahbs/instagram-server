const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const errorModule = require('../../../modules/error_modules');

const commentDao = require('../dao/commentDao');
const userDao = require('../dao/userDao');
const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');
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
        const insertCommmentRows = await commentDao.insertComment(insertCommentParams);
        return res.json({commentId : insertCommmentRows.insertId,
            isSucess : true, code : 200, message : "댓글생성성공"});
    } catch (error) {
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
    // 댓글 삭제시 댓글 목록 바로 업데이트해주는 트랜잭션필요
    try {
        const userId = req.verifiedToken.id;
        const [userIdx] = await userDao.getUserIdxbyId(userId);
        const deleteCommentParams = [commentId];
        const deleteCommmentRows = await commentDao.deleteComment(deleteCommentParams);
        return res.json({isSucess : true, code : 200, message : "댓글 삭제 성공"});
    } catch (error) {
        logger.error(`App - DeleteComment Query error\n: ${JSON.stringify(error)}`);

            return false;
    }
}