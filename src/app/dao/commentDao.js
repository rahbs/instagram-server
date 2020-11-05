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


module.exports = {
    insertComment,
    deleteComment,
    selectComment,
    selectCommentIsDeleted,
  };
  