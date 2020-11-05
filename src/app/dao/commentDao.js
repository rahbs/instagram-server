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

module.exports = {
    insertComment,
    deleteComment,
  };
  