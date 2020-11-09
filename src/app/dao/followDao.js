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

//팔로우 리스트 조회
// async function requestFollow(requestFollowParams) {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const selectFollowQuery = `select follow from follow where followingUserIdx = ? && followedUserIdx = ?;`;

    
//         const [requestFollowRows] = await connection.query(requestFollowQuery,requestFollowParams);
//         connection.release();

// }
//팔로잉 리스트 조회

//팔로우 요청 수락
async function acceptFollow(acceptFollowParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const acceptFollowQuery = `update followRequest set isAccepted = 'Y' where id=? && isDeleted = 'N';`;

    const selectFollowQuery = `select follow from follow where followingUserIdx = ? && followedUserIdx = ?;`;
    const requestFollowagainQuery = `update follow set follow = 'Y' where followingUserIdx = ? && followedUserIdx = ?;`;
    const requestFollowQuery =`insert into follow(followingUserIdx, followedUserIdx) values(?,?) ;`;

    const findIdQuery = `select requestingUserIdx as ingId, requestedUserIdx as edId from followRequest where id=?`;
    try {
        await connection.beginTransaction();
        const [acceptFollowRows] = await connection.query(acceptFollowQuery,acceptFollowParams);
        const [findIdQueryRows] = await connection.query(findIdQuery,acceptFollowParams);
        requestFollowParams = [findIdQueryRows[0].ingId,findIdQueryRows[0].edId];
        const [selectFollowRows] = await connection.query(selectFollowQuery,requestFollowParams);
        if(selectFollowRows.length < 1){
            const [requestFollowRows] = await connection.query(requestFollowQuery,requestFollowParams);
        } else if(selectFollowRows[0].follow === 'N'){
            const [requestFollowRows] = await connection.query(requestFollowagainQuery,requestFollowParams);
        }
        await connection.commit();
        return acceptFollowRows;
    } catch (error) {
        logger.error(`App - acceptFollow Transaction Query error\n: ${JSON.stringify(error)}`);
         await connection.rollback()
    }finally{
        connection.release();
    }
    
}
async function selectRequestFollowbyUserId(selectRequestFollowbyUserIdParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectRequestFollowbyUserIdQuery = `select requestedUserIdx as Id from followRequest where id = ?;`;
    const [selectRequestFollowbyUserIdRows] = await connection.query(selectRequestFollowbyUserIdQuery,selectRequestFollowbyUserIdParams);
    if(selectRequestFollowbyUserIdRows.length < 1){
        connection.release();
        return "";
    }
    
    connection.release();    
    return selectRequestFollowbyUserIdRows[0].Id
}
//팔로우 요청 거절
async function refuseFollow(refuseFollowParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const refuseFollowQuery = `update followRequest set isDeleted = 'Y' where id=? && isDeleted = 'N';`;
    const [refuseFollowRows] = await connection.query(refuseFollowQuery,refuseFollowParams);
    connection.release();    
    return refuseFollowRows;
}
//친한 친구 설정
async function setCloseFriend(setCloseFriendParams) {
    try {   
        const connection = await pool.getConnection(async (conn) => conn);
        try {
            const selectCloseFriendQuery = `select isCloseFriend from follow where followedUserIdx = ? && followingUserIdx = ?;`;
            const setCloseFriendQuery = `update follow set isCloseFriend = 'Y' where followedUserIdx = ? && followingUserIdx = ?;`;
            const setCloseFriendCancelQuery = `update follow set isCloseFriend = 'N' where followedUserIdx = ? && followingUserIdx = ?;`;
            const [selectCloseFriendRows] = await connection.query(selectCloseFriendQuery,setCloseFriendParams);
            if(selectCloseFriendRows[0].isCloseFriend==='N'){
                const [setCloseFriendRows] = await connection.query(setCloseFriendQuery,setCloseFriendParams);
                connection.release(); 
                return 'Y';
            }
            else{
                const [setCloseFriendRows] = await connection.query(setCloseFriendCancelQuery,setCloseFriendParams);
                connection.release(); 
                return 'N';
            }
        } catch (error) {
            logger.error(`App - setCloseFriend function Query error\n: ${JSON.stringify(error)}`);
            connection.release();
            return false;
        }
    } catch (error) {
        logger.error(`App - setCloseFriend connection error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}
async function isValidFollow(isValidFollowParams){
    const connection = await pool.getConnection(async (conn) => conn);
    const isValidFollowQuery = `select followedUserIdx as Id from follow where followedUserIdx = ? && followingUserIdx = ? && follow = 'Y';`;
    const [isValidFollowRows] = await connection.query(isValidFollowQuery,isValidFollowParams);
    connection.release;
    if(isValidFollowRows.length <1){
        return 0;
    }
    return isValidFollowRows[0].Id;
}
// 해당 유저의 게시물 혹은 스토리 숨기기
async function hideFeedOrStory(kind,userIdx,userId){
    const connection = await pool.getConnection(async (conn) => conn);
    const hideFeedOrStoryParams = [userIdx,userId];
    if(kind==='F'){
        const selecthideFeedQuery = `select muteFeed from follow where followedUserIdx = ? && followingUserIdx = ?;`;
        const hideFeedQuery = `update follow set muteFeed ='Y' where followedUserIdx = ? && followingUserIdx = ?;`;
        const hideFeedCancelQuery = `update follow set muteFeed ='N' where followedUserIdx = ? && followingUserIdx = ?;`;
        const [selecthideFeedRows] = await connection.query(selecthideFeedQuery,hideFeedOrStoryParams);
        if(selecthideFeedRows[0].muteFeed === 'Y'){
            const [hideFeedOrStoryRows] = await connection.query(hideFeedCancelQuery,hideFeedOrStoryParams);
            connection.release;
            return 'FN'
        }
        const [hideFeedOrStoryRows] = await connection.query(hideFeedQuery,hideFeedOrStoryParams);
        connection.release;
        return 'FY';
    }
    else if(kind==='S'){
        const selecthideStoryQuery = `select muteStory from follow where followedUserIdx = ? && followingUserIdx = ?;`;
        const hideStoryQuery = `update follow set muteStory ='Y' where followedUserIdx = ? && followingUserIdx = ?;`;
        const hideStoryCancelQuery = `update follow set muteStory ='N' where followedUserIdx = ? && followingUserIdx = ?;`;
        const [selecthideStoryRows] = await connection.query(selecthideStoryQuery,hideFeedOrStoryParams);
        if(selecthideStoryRows[0].muteStory === 'Y'){
            const [hideFeedOrStoryRows] = await connection.query(hideStoryCancelQuery,hideFeedOrStoryParams);
            connection.release();
            return 'SN'
        }
        const [hideFeedOrStoryRows] = await connection.query(hideStoryQuery,hideFeedOrStoryParams);
        connection.release;
        return 'SY';
    }
    connection.release();
    return ;
}
//팔로우 취소
async function cancelFollowing(cancelFollowParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectFollowQuery = `select follow from follow where followedUserIdx = ? && followingUserIdx = ?;`;
    const [selectFollowRows] = await connection.query(selectFollowQuery,cancelFollowParams);
    if(selectFollowRows.length < 1){

    }
    else{
        const cancelFollowQuery = `update follow set follow = 'N' where followedUserIdx = ? && followingUserIdx = ?;`;
        const [cancelFollowRows] = await connection.query(cancelFollowQuery,cancelFollowParams);
        connection.release();    
        return cancelFollowRows;
    }
    
}




module.exports = {
    requestFollow,
    requestFollowPrivateUser,
    acceptFollow,
    selectRequestFollowbyUserId,
    refuseFollow,
    setCloseFriend,
    isValidFollow,
    hideFeedOrStory,
    cancelFollowing,

}
