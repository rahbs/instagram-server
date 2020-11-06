const { pool } = require("../../../config/database");

// 댓글생성
async function insertComment(insertCommentParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertCommentQuery = `insert into comment(Id,feedId,userIdx, content) values (LAST_INSERT_ID(),?,?,?);`;
  const [insertCommentRows] = await connection.query(insertCommentQuery, insertCommentParams);
 
  connection.release();

  return insertCommentRows
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
    insertComment,
    deleteComment,
    selectComment,
    selectCommentIsDeleted,
    selectCommentList,
    likeComment,
    likeFeed,
  };
  