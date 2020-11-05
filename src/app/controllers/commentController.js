const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const errorModule = require('../../../modules/error_modules');

const commentDao = require('../dao/commentDao');
const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

exports.createComment = async function (req, res) {
    const {
        feedId, userIdx, comment 
    } = req.body;
    // if(!feedId) return errorModule.messages(false,301,"없는 피드입니다.");
    // if(!userIdx) return res.json({});
    // if(!comment) return res.json({});

    try {
        const insertCommentParams = [feedId,userIdx,comment];
        const insertCommmentRows = await commentDao.insertComment(insertCommentParams);
        return res.json({isSucess : true, code : 200, message : "댓글생성성공"});
    } catch (error) {
        logger.error(`App - InsertComment Query error\n: ${JSON.stringify(error)}`);

            return false;
    }
}