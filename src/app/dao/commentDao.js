const { pool } = require("../../../config/database");
//댓글 상세 보기
async function selectCommentByFeedId(selectCommentByFeedIdParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectCommentByFeedIdQuery = 
    `select profileImgUrl,profile.userId,commentTable.commentID,commentTable.userIdx,content,
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
left outer join (select profileImgUrl, user.userIdx,user.userId from user inner join comment c on user.userIdx = c.userIdx where feedId = ? && c.isDeleted = 'N' group by userIdx)profile on profile.userIdx = commentTable.userIdx
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

//대댓글 상세보기
async function selectReCommentByCommentId(commentId,limitStart,limitCount) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectReCommentByCommentIdQuery = 
    `select profileImgUrl,profile.userId,commentTable.commentID,commentTable.userIdx,content,
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
from (select id as commentID,comment.userIdx,content, createdAt from comment where comment.parentId = ? && comment.isDeleted ='N')commentTable
left outer join (select case when commentId !=0
 then commentId
 end as commentId,
 count(status ='Y') as likecounts from heart group by commentId)heartTable on heartTable.commentId = commentTable.commentID
left outer join (select profileImgUrl, user.userIdx, user.userId from user inner join comment c on user.userIdx = c.userIdx where c.parentId = ? && c.isDeleted = 'N' group by userIdx)profile on profile.userIdx = commentTable.userIdx
limit ?,?;`;
 const Params = [commentId,commentId,Number(limitStart),Number(limitCount)];
    const [selectReCommentByCommentIdRows]= await connection.query(selectReCommentByCommentIdQuery,Params);
    connection.release();
    return [selectReCommentByCommentIdRows]; 
    
  } catch (error) {
    logger.error(`App - selectReCommentByCommentId function error\n: ${JSON.stringify(error)}`);
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
  try {
    await connection.beginTransaction();
    const insertCommentQuery = `insert into comment(feedId,userIdx, content) values (?,?,?);`;
    const selectUserInfoQuery = `select profileImgUrl,userId from user where userIdx = ?;`;
    const insertCommentParams = [feedId,userIdx,comment];
    const [insertCommentRows] = await connection.query(insertCommentQuery, insertCommentParams);
    const [selectUserInfoRows] = await connection.query(selectUserInfoQuery,userIdx);
    const ID = await connection.query('SELECT last_insert_id() as idx;');
    
    

    const insertAcitivityQuery = `insert into activity(userIdx, userId, writing, user_,profileImgUrl,commentId) values(?,?,?,?,?,?);`;
    const selectUserIdQuery = `select userId from user where userIdx = ?;`;
    const [selectUserIdRows] = await connection.query(selectUserIdQuery,userIdx);
    const userId = selectUserIdRows[0].userId;
    const selectUserQuery = `select userIdx from feed where Id = ?;`;
    const [selectUserRows] = await connection.query(selectUserQuery,feedId);
    const user_ = selectUserRows[0].userIdx;
    const writing = userId+"님이 댓글을 남겼습니다:  "+comment;
    const profileImgUrlQuery =`select profileImgUrl from user where userIdx=?;`; 
    const [profileImgUrlRows] = await connection.query(profileImgUrlQuery,userIdx);
    const profileImgUrl = profileImgUrlRows[0].profileImgUrl;
    const commentId = ID[0][0].idx;
    const insertAcitivityParams = [userIdx,userId,writing,user_,profileImgUrl,commentId];
    const [insertAcitivityRows] = await connection.query(insertAcitivityQuery,insertAcitivityParams);
    
    const Rows = [ID[0][0].idx, selectUserInfoRows[0].profileImgUrl, selectUserInfoRows[0].userId];;
    await connection.commit();
    return Rows;
  } catch (error) {
    //console.log(error);
    logger.error(`App - insertComment function error\n: ${JSON.stringify(error)}`);
    
    await connection.rollback();
  }finally{
    connection.release();
  }  
}
// 대댓글생성
async function insertreComment(feedId,parentId,userIdx,comment) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    
    await connection.beginTransaction();
    const insertCommentQuery = `insert into comment(feedId, content, parentId, userIdx)  values(?,?,?,?);`;
    const selectUserInfoQuery = `select profileImgUrl,userId from user where userIdx = ?;`;
    const insertCommentParams = [feedId,comment,parentId,userIdx];
    const [insertCommentRows] = await connection.query(insertCommentQuery, insertCommentParams);
    const ID = await connection.query('SELECT last_insert_id() as idx;');
    const [selectUserInfoRows] = await connection.query(selectUserInfoQuery,userIdx);
    
    
    

    const insertAcitivityQuery = `insert into activity(userIdx, userId, writing, user_,profileImgUrl,commentId) values(?,?,?,?,?,?);`;
    const selectUserIdQuery = `select userId from user where userIdx = ?;`;
    const [selectUserIdRows] = await connection.query(selectUserIdQuery,userIdx);
    const userId = selectUserIdRows[0].userId;
  
    const selectUserQuery = `select userIdx from comment where id = ?;`;
    const [selectUserRows] = await connection.query(selectUserQuery,parentId);
    const user_ = selectUserRows[0].userIdx;
    
    const writing = userId+"님이 댓글을 남겼습니다:\n"+comment;
    
    const profileImgUrlQuery =`select profileImgUrl from user where userIdx=?;`; 
    const [profileImgUrlRows] = await connection.query(profileImgUrlQuery,userIdx);
    const profileImgUrl = profileImgUrlRows[0].profileImgUrl;
    
    const commentId = ID[0][0].idx;
    
    const insertAcitivityParams = [userIdx,userId,writing,user_,profileImgUrl,commentId];
    const [insertAcitivityRows] = await connection.query(insertAcitivityQuery,insertAcitivityParams);
    const Rows = [ID[0][0].idx, selectUserInfoRows[0].profileImgUrl, selectUserInfoRows[0].userId];;
    await connection.commit();
    return Rows;
  } catch (error) {
    logger.error(`App - insertComment function error\n: ${JSON.stringify(error)}`);
    
    await connection.rollback();
  }finally{
    connection.release();
  }  
}
// 댓글삭제
async function deleteComment(commentId) {

    const connection = await pool.getConnection(async (conn) => conn);
    try {
      await connection.beginTransaction();
      const deleteCommentQuery = `update comment set isDeleted='Y' where id = ?`;
      const deleteCommentParams = [commentId];
      const updateActivityQuery = `update activity set isDeleted = 'Y' where commentId = ?;`;
      const [updateActivityRows] = await connection.query(updateActivityQuery,commentId);
      const [deleteCommentRows] = await connection.query(deleteCommentQuery, deleteCommentParams);
      await connection.commit();
      
      return deleteCommentRows
    } catch (error) {
      logger.error(`App - deleteComment function error\n: ${JSON.stringify(error)}`);
      await connection.rollback();
    }finally{
      connection.release();
    }  
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



//댓글 좋아요
async function likeComment(userIdx,commentID) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      await connection.beginTransaction();
      const likeCommentQuery = `insert into heart(userIdx,commentId,feedId,isLiked,status) values (?,?,0,'Y','C');`;
      const likeCommenthateQuery = `update heart set isLiked = 'N' where userIdx = ? && commentId = ? && status ='C';`;
      const likeCommentagainQuery = `update heart set isLiked = 'Y' where userIdx = ? && commentId = ? && status ='C';`;
      const searchlikeCommentQuery = `select isLiked from heart where userIdx = ? && commentId = ? && status ='C';`;
      const likeCommentParams = [userIdx,commentID];
      const [searchlikeCommentRows]= await connection.query(searchlikeCommentQuery, likeCommentParams);
    

    const insertAcitivityQuery = `insert into activity(userIdx, userId, writing, user_,profileImgUrl,commentId,commentlike) values(?,?,?,?,?,?,'Y');`;
    const selectUserIdQuery = `select userId from user where userIdx = ?;`;
    const [selectUserIdRows] = await connection.query(selectUserIdQuery,userIdx);
    const userId = selectUserIdRows[0].userId;
    const selectUserQuery = `select userIdx from comment where Id = ?;`;
    const [selectUserRows] = await connection.query(selectUserQuery,commentID);
    const user_ = selectUserRows[0].userIdx;
    const writing = userId+"님이 회원님의 댓글을 좋아합니다:\n";
    const profileImgUrlQuery =`select profileImgUrl from user where userIdx=?;`; 
    const [profileImgUrlRows] = await connection.query(profileImgUrlQuery,userIdx);
    const profileImgUrl = profileImgUrlRows[0].profileImgUrl;
    const insertAcitivityParams = [userIdx,userId,writing,user_,profileImgUrl,commentID];
    
    

      if(searchlikeCommentRows.length <1){
          const [likeCommentRows] = await connection.query(likeCommentQuery, likeCommentParams);
          const [insertAcitivityRows] = await connection.query(insertAcitivityQuery,insertAcitivityParams);
          await connection.commit();
          return 'Y'
      }
      else if(searchlikeCommentRows[0].isLiked === 'Y'){
        const [likeCommentRows] = await connection.query(likeCommenthateQuery, likeCommentParams);
        const updateActivityQuery = `update activity set commentlike ='N', isDeleted = 'Y' where commentId = ? && commentLike = 'Y';`;
        const updateActivityRows = await connection.query(updateActivityQuery,commentID);
        await connection.commit();
        return 'N'
      }
      else if(searchlikeCommentRows[0].isLiked === 'N'){
        const [likeCommentRows] = await connection.query(likeCommentagainQuery, likeCommentParams);
        const [selectActivity] = await connection.query('select commentlike from activity where commentId = ?;',commentID);
        if(selectActivity.length < 1){
          const [insertAcitivityRows] = await connection.query(insertAcitivityQuery,insertAcitivityParams);
          await connection.commit();
          return 'Y'
        }
        const updateActivityQuery = `update activity set commentlike ='Y', isDeleted = 'N' where commentId = ? && commentLike = 'N';`;
        const updateActivityRows = await connection.query(updateActivityQuery,commentID);
        await connection.commit();
        return 'Y'
      }   
    return null;
    } catch (error) {
      console.log(error);
      logger.error(`App - likeComment function error\n: ${JSON.stringify(error)}`);
      await connection.rollback();
    }finally{
      connection.release();
    }
  }
//피드 좋아요/취소
async function likeFeed(userIdx,feedID) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      await connection.beginTransaction();
      const likeFeedQuery = `insert into heart(userIdx,commentId,feedId,isLiked,status) values (?,0,?,'Y','F');`;
      const likeFeedhateQuery = `update heart set isLiked = 'N' where userIdx = ? && feedId = ? && status ='F';`;
      const likeFeedagainQuery = `update heart set isLiked = 'Y' where userIdx = ? && feedId = ? && status ='F';`;
      const searchlikeFeedQuery = `select isLiked from heart where userIdx = ? && feedId = ? && status ='F';`;
      const likeFeedParams = [userIdx,feedID];
      const [searchlikeFeedRows]= await connection.query(searchlikeFeedQuery, likeFeedParams);
    
      const insertAcitivityQuery = `insert into activity(userIdx, userId, writing, user_,profileImgUrl,feedId,feedlike) values(?,?,?,?,?,?,'Y');`;
      const selectUserIdQuery = `select userId from user where userIdx = ?;`;
      const [selectUserIdRows] = await connection.query(selectUserIdQuery,userIdx);
      const userId = selectUserIdRows[0].userId;
      const selectUserQuery = `select userIdx from feed where Id = ?;`;
      const [selectUserRows] = await connection.query(selectUserQuery,feedID);
      const user_ = selectUserRows[0].userIdx;
      const writing = userId+"님이 회원님의 게시물을 좋아합니다:\n";
      const profileImgUrlQuery =`select profileImgUrl from user where userIdx=?;`; 
      const [profileImgUrlRows] = await connection.query(profileImgUrlQuery,userIdx);
      const profileImgUrl = profileImgUrlRows[0].profileImgUrl;
      const insertAcitivityParams = [userIdx,userId,writing,user_,profileImgUrl,feedID];


      if(searchlikeFeedRows.length <1){
        const [likeFeedRows] = await connection.query(likeFeedQuery, likeFeedParams);
        const [insertAcitivityRows] = await connection.query(insertAcitivityQuery,insertAcitivityParams);
          await connection.commit();
        return 'Y'
      }
      else if(searchlikeFeedRows[0].isLiked === 'Y'){
        const [likeFeedRows] = await connection.query(likeFeedhateQuery, likeFeedParams);
        const updateActivityQuery = `update activity set feedlike ='N', isDeleted = 'Y' where feedId = ? && isDeleted = 'N';`;
        const updateActivityRows = await connection.query(updateActivityQuery,feedID);
        await connection.commit();
        return 'N'
      }
      else if(searchlikeFeedRows[0].isLiked === 'N'){
        const [likeFeedRows] = await connection.query(likeFeedagainQuery, likeFeedParams);
        const [selectActivity] = await connection.query('select feedlike from activity where feedId = ?;',feedID);
        if(selectActivity.length < 1){
          const [insertAcitivityRows] = await connection.query(insertAcitivityQuery,insertAcitivityParams);
          await connection.commit();
          return 'Y'
        }
        const updateActivityQuery = `update activity set feedlike ='Y', isDeleted = 'N' where feedId = ? && isDeleted = 'Y';`;
        const updateActivityRows = await connection.query(updateActivityQuery,feedID);
          await connection.commit();
        return 'Y'
      }    
    return null;
      
    } catch (error) {
      logger.error(`App - likeFeed function error\n: ${JSON.stringify(error)}`);
      await connection.rollback();
    } finally{
      connection.release();
    }
    
  }


module.exports = {
    selectCommentByFeedId,
    insertComment,
    deleteComment,
    selectComment,
    selectCommentIsDeleted,
    selectReCommentByCommentId,
    likeComment,
    likeFeed,
    commentUser,
    insertreComment,
  };
  