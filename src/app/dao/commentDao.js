const { pool } = require("../../../config/database");

// index
async function insertComment(insertCommentParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertCommentQuery = `insert into comment(feedId,userIdx, content) values (?,?,?);`;

  const [insertCommentRows] = await connection.query(insertCommentQuery, insertCommentParams);
  connection.release();

  return insertCommentRows
}

module.exports = {
    insertComment,
  };
  