const { pool } = require("../../../config/database");


//팔로우 요청
async function requestFollow(requestFollowParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const requestFollowQuery =``;
    const [requestFollowRows] = await connection.query(requestFollowQuery,requestFollowParams);

    connection.release();
    return requestFollowRows;
}

module.exports = {
    requestFollow,
}
