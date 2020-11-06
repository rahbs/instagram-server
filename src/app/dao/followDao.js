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
        connection.release();
        return 'Y'
    } //팔로우 취소
    // else if(selectFollowRows[0].follow === 'Y'){
    //     const [requestFollowRows] = await connection.query(requestFollowhateQuery,requestFollowParams);
    //     return 'N'
    // }
    else if(selectFollowRows[0].follow === 'N'){
        const [requestFollowRows] = await connection.query(requestFollowagainQuery,requestFollowParams);
        connection.release();
        return 'Y'
    }
    else {
        connection.release();
        return 'Y'
    }
}
//비공개 유저 팔로우요청
async function requestFollowPrivateUser(requestFollowPrivateUserParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const requestFollowPrivateUserQuery = `insert into followRequest(id,requestingUserIdx, requestedUserIdx) values (LAST_INSERT_ID(),?,?);`;
    const requestFollowPrivateUserExistQuery = `select exists(select Id from followRequest where requestingUserIdx =? && requestedUserIdx = ? && isDeleted = 'N') as exist;`;
    const requestFollowAgainPrivateUserExistQuery = `select exists(select Id from followRequest where requestingUserIdx =? && requestedUserIdx = ? && isDeleted = 'Y') as exist;`;
    const requestFollowPrivateUserCancelQuery = `update followRequest set isDeleted = 'Y' where requestingUserIdx =? && requestedUserIdx = ?;`;
    const requestFollowPrivateUserAgainQuery = `update followRequest set isDeleted = 'N' where requestingUserIdx =? && requestedUserIdx = ?;`;
    
    const requestFollowPrivateUserFollowIdQuery = `select Id from followRequest where requestingUserIdx =? && requestedUserIdx = ? && isDeleted = 'N'`;
    const [requestFollowPrivateUserExistRows] = await connection.query(requestFollowPrivateUserExistQuery,requestFollowPrivateUserParams);
    const [requestFollowAgainPrivateUserExistRows] = await connection.query(requestFollowAgainPrivateUserExistQuery,requestFollowPrivateUserParams);

    //팔로우 요청 취소
    if(requestFollowPrivateUserExistRows[0].exist === 1){
        const [requestFollowPrivateUserCancelRows] = await connection.query(requestFollowPrivateUserCancelQuery,requestFollowPrivateUserParams);
        connection.release();
        return 'N'
    }//팔로우 신청했던 기록이 남아있는 경우
    else if(requestFollowAgainPrivateUserExistRows[0].exist === 1){
        const [requestFollowPrivateUserAgainRows] = await connection.query(requestFollowPrivateUserAgainQuery,requestFollowPrivateUserParams);
        const [requestFollowPrivateUserFollowIdRows] = await connection.query(requestFollowPrivateUserFollowIdQuery,requestFollowPrivateUserParams);//Id 가져오기
        connection.release();
        return requestFollowPrivateUserFollowIdRows[0].Id
    }//최초요청
    else{
        const [requestFollowPrivateUserRows] = await connection.query(requestFollowPrivateUserQuery,requestFollowPrivateUserParams);
        connection.release();
        return requestFollowPrivateUserRows.insertId
    }
   
}


module.exports = {
    requestFollow,
    requestFollowPrivateUser,
}
