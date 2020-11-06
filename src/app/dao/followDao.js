const { pool } = require("../../../config/database");


//팔로우 요청
async function requestFollow(requestFollowParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectFollowQuery = `select follow from follow where followingUserIdx = ? && followedUserIdx = ?;`;
    const requestFollowhateQuery = `update follow set follow = 'N' where followingUserIdx = ? && followedUserIdx = ?;`;
    const requestFollowagainQuery = `update follow set follow = 'Y' where followingUserIdx = ? && followedUserIdx = ?;`;

    const requestFollowQuery =`insert into follow(followingUserIdx, followedUserIdx) values(?,?) ;`;
    const [selectFollowRows] = await connection.query(selectFollowQuery,requestFollowParams);
    if(selectFollowRows.length < 1){
        const [requestFollowRows] = await connection.query(requestFollowQuery,requestFollowParams);
        return 'Y'
    } //팔로우 취소
    else if(selectFollowRows[0].follow === 'Y'){
        const [requestFollowRows] = await connection.query(requestFollowhateQuery,requestFollowParams);
        return 'N'
    }
    else if(selectFollowRows[0].follow === 'N'){
        const [requestFollowRows] = await connection.query(requestFollowagainQuery,requestFollowParams);
        return 'Y'
    }
    

    connection.release();
    return null;
}


module.exports = {
    requestFollow,
}
