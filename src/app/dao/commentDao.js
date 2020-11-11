const { pool } = require("../../../config/database");
//댓글 상세 보기
async function selectCommentByFeedId(selectCommentByFeedIdParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectCommentByFeedIdQuery = 
    `select profileImgUrl,commentTable.commentID,commentTable.userIdx,content,
    case
        when timestampdiff(second,createdAt,now())<60
            then concat(timestampdiff(second,now(),createdAt),'초')
        when timestampdiff(second,createdAt,now())>=60 && timestampdiff(second,createdAt,now())<3600
            then concat(timestampdiff(minute,createdAt,now()),'분')
         when timestampdiff(second,createdAt,now())>=3600 && timestampdiff(second,createdAt,now())<86400
                then concat(timestampdiff(hour,createdAt,now()),'시간')
         when timestampdiff(second,createdAt,now())>=86400 && timestampdiff(second,createdAt,now())<604800
             then concat(timestampdiff(day,createdAt,now()),'일')
          when timestampdiff(second,createdAt,now())>=604800 && timestampdiff(second,createdAt,now())<3153600
              then concat(timestampdiff(week,createdAt,now()),'주')
         when timestampdiff(second,createdAt,now())>=3153600
             then concat(timestampdiff(year,createdAt,now()),'년')
             end as created
    ,concat('좋아요 ',likecounts,'개') as likecount
from (select Id as commentID,comment.userIdx,content, createdAt from comment where comment.feedId = ? && comment.isDeleted ='N')commentTable
left outer join (select case when commentId !=0
 then commentId
 end as commentId,
 count(status ='Y') as likecounts from heart group by commentId)heartTable on heartTable.commentId = commentTable.commentID
left outer join (select profileImgUrl, user.userIdx from user inner join comment c on user.userIdx = c.userIdx where feedId = ? && c.isDeleted = 'N' group by userIdx)profile on profile.userIdx = commentTable.userIdx
limit ?,?;`;
 const Params = [selectCommentByFeedIdParams[0],selectCommentByFeedIdParams[0],Number(selectCommentByFeedIdParams[1]),Number(selectCommentByFeedIdParams[2])];
    const [selectCommentByFeedIdRows]= await connection.query(selectCommentByFeedIdQuery,Params);
    connection.release();
    return [selectCommentByFeedIdRows]; 
    
  } catch (error) {
    logger.error(`App - selectCommentByFeedId function error\n: ${JSON.stringify(error)}`);
    connection.release();
    return false;
  }
}
async function commentUser(commentUserParams){
  const connection = await pool.getConnection(async (conn) => conn);
  const commentUserQuery = `select profileImgUrl, userId, user.userIdx, caption from user
  inner join feed f on user.userIdx = f.userIdx where f.userIdx =? && f.id = ?;`;
  const [commentUserRows] = await connection.query(commentUserQuery,commentUserParams);
  connection.release;
  return commentUserRows[0]
}
// 댓글생성
async function insertComment(feedId,userIdx,comment) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertCommentQuery = `insert into comment(Id,feedId,userIdx, content) values (LAST_INSERT_ID(),?,?,?);`;

  const selectUserInfoQuery = `select profileImgUrl,userId from user where userIdx = ?;`;
  const insertCommentParams = [feedId,userIdx,comment];
  const [insertCommentRows] = await connection.query(insertCommentQuery, insertCommentParams);
  const [selectUserInfoRows] = await connection.query(selectUserInfoQuery,userIdx);
  const Rows = [insertCommentRows.insertId, selectUserInfoRows[0].profileImgUrl, selectUserInfoRows[0].userId];
  connection.release();

  return Rows;
}
// 댓글삭제
async function deleteComment(deleteCommentParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteCommentQuery = `update comment set isDeleted='Y' where id = ?`;
  
    const [deleteCommentRows] = await connection.query(deleteCommentQuery, deleteCommentParams);
    connection.release();
  
    return deleteCommentRows
  }
//유효한 댓글 조회
  async function selectComment(selectCommentParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectCommentQuery = `select id from comment where id = ?;`;
  
    const [selectCommentRows] = await connection.query(selectCommentQuery, selectCommentParams);
    connection.release();
  
    return selectCommentRows
  }
//이미 삭제되었는지 여부 검사
  async function selectCommentIsDeleted(selectCommentIsDeletedParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectCommentIsDeletedQuery = `select id from comment where id = ? && isDeleted = 'N';`;
  
    const [selectCommentIsDeletedRows] = await connection.query(selectCommentIsDeletedQuery, selectCommentIsDeletedParams);
    connection.release();
  
    return selectCommentIsDeletedRows
  }

//댓글 조회
async function selectCommentList(selectCommentListParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectCommentListQuery = ``;
  
    const [selectCommentListRows] = await connection.query(selectCommentListQuery, selectCommentListParams);
    connection.release();
  
    return selectCommentListRows
  }

//댓글 좋아요
async function likeComment(likeCommentParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    
    const likeCommentQuery = `insert into heart(userIdx,commentId,feedId,isLiked,status) values (?,?,0,'Y','C');`;
    const likeCommenthateQuery = `update heart set isLiked = 'N' where userIdx = ? && commentId = ? && status ='C';`;
    const likeCommentagainQuery = `update heart set isLiked = 'Y' where userIdx = ? && commentId = ? && status ='C';`;
    const searchlikeCommentQuery = `select isLiked from heart where userIdx = ? && commentId = ? && status ='C';`;
    
    const [searchlikeCommentRows]= await connection.query(searchlikeCommentQuery, likeCommentParams);
    
    if(searchlikeCommentRows.length <1){
        const [likeCommentRows] = await connection.query(likeCommentQuery, likeCommentParams);
        connection.release();
        return 'Y'
    }
    else if(searchlikeCommentRows[0].isLiked === 'Y'){
        const [likeCommentRows] = await connection.query(likeCommenthateQuery, likeCommentParams);
        connection.release();
        return 'N'
    }
    else if(searchlikeCommentRows[0].isLiked === 'N'){
        const [likeCommentRows] = await connection.query(likeCommentagainQuery, likeCommentParams);
        connection.release();
        return 'Y'
    }    
    
  
    return null;
  }
//피드 좋아요/취소
async function likeFeed(likeFeedParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    
    const likeFeedQuery = `insert into heart(userIdx,commentId,feedId,isLiked,status) values (?,0,?,'Y','F');`;
    const likeFeedhateQuery = `update heart set isLiked = 'N' where userIdx = ? && feedId = ? && status ='F';`;
    const likeFeedagainQuery = `update heart set isLiked = 'Y' where userIdx = ? && feedId = ? && status ='F';`;
    const searchlikeFeedQuery = `select isLiked from heart where userIdx = ? && feedId = ? && status ='F';`;
    
    const [searchlikeFeedRows]= await connection.query(searchlikeFeedQuery, likeFeedParams);
    
    if(searchlikeFeedRows.length <1){
        const [likeFeedRows] = await connection.query(likeFeedQuery, likeFeedParams);
        connection.release();
        return 'Y'
    }
    else if(searchlikeFeedRows[0].isLiked === 'Y'){
        const [likeFeedRows] = await connection.query(likeFeedhateQuery, likeFeedParams);
        connection.release();
        return 'N'
    }
    else if(searchlikeFeedRows[0].isLiked === 'N'){
        const [likeFeedRows] = await connection.query(likeFeedagainQuery, likeFeedParams);
        connection.release();
        return 'Y'
    }    
    return null;
  }


module.exports = {
    selectCommentByFeedId,
    insertComment,
    deleteComment,
    selectComment,
    selectCommentIsDeleted,
    selectCommentList,
    likeComment,
    likeFeed,
    commentUser,
  };
  