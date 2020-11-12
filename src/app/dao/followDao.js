const { pool } = require("../../../config/database");


//팔로우 요청
async function requestFollow(userIdx,followUserIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const requestFollowParams = [userIdx,followUserIdx];
        const selectFollowQuery = `select follow from follow where followingUserIdx = ? && followedUserIdx = ?;`;
        const requestFollowhateQuery = `update follow set follow = 'N' where followingUserIdx = ? && followedUserIdx = ?;`;
        const requestFollowagainQuery = `update follow set follow = 'Y' where followingUserIdx = ? && followedUserIdx = ?;`;

        const requestFollowQuery =`insert into follow(followingUserIdx, followedUserIdx) values(?,?) ;`;
        const [selectFollowRows] = await connection.query(selectFollowQuery,requestFollowParams);

    //
    const insertAcitivityQuery = `insert into activity(userIdx, userId, writing, user_,profileImgUrl,followingUserIdx,followedUserIdx) values(?,?,?,?,?,?,?);`;
      const selectUserIdQuery = `select userId from user where userIdx = ?;`;
      const [selectUserIdRows] = await connection.query(selectUserIdQuery,userIdx);
      const userId = selectUserIdRows[0].userId;
      //const selectUserQuery = `select followingUserIdx from follow where followingUserIdx = ? && followedUserIdx = ?;`;
      //const selectUserParams = [followUserIdx,userIdx];
      //const [selectUserRows] = await connection.query(selectUserQuery,);
      const user_ = followUserIdx;
      const writing = userId+"님이 회원님을 팔로우하기 시작했습니다.:\n";
      const profileImgUrlQuery =`select profileImgUrl from user where userIdx=?;`; 
      const [profileImgUrlRows] = await connection.query(profileImgUrlQuery,userIdx);
      const profileImgUrl = profileImgUrlRows[0].profileImgUrl;


    if(selectFollowRows.length < 1){
        const [requestFollowRows] = await connection.query(requestFollowQuery,requestFollowParams);
        const insertAcitivityParams = [userIdx,userId,writing,user_,profileImgUrl,userIdx,followUserIdx];
        const [insertAcitivityRows] = await connection.query(insertAcitivityQuery,insertAcitivityParams);
        await connection.commit();
        return 'Y'
    } 
    else if(selectFollowRows[0].follow === 'N'){
        const [requestFollowRows] = await connection.query(requestFollowagainQuery,requestFollowParams);
        
        const updateActivityQuery = `update activity set isDeleted = 'Y' where followingUserIdx =? &&followedUserIdx=?;`;
        const updateActivityParams = [userIdx,followUserIdx];
        const updateActivityRows = await connection.query(updateActivityQuery,updateActivityParams);
        await connection.commit();
        return 'Y'
    }
    else if(selectFollowRows[0].follow === 'Y'){
        const [requestFollowRows] = await connection.query(requestFollowhateQuery,requestFollowParams);
        await connection.commit();
        return 'N'
    }
    else {

        await connection.commit();
        return 'Y'
    }
    } catch (error) {
        logger.error(`App - requestFollow function error\n: ${JSON.stringify(error)}`);
        await connection.rollback();
    } finally{
        connection.release();
    }
    
}
//비공개 유저 팔로우요청
async function requestFollowPrivateUser(userIdx,followUserIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const requestFollowPrivateUserParams = [userIdx,followUserIdx];
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

//팔로잉/팔로워 리스트 조회
async function followList(userIdx,followType){
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const selectFollowUserQuery = `select userIdx,userId, profileImgUrl, name from user where userIdx = ?;`;
        if(followType === "follower"){
            const followerListQuery = `select followingUserIdx as Id from follow where followedUserIdx =?;`;
            const [followListRows] = await connection.query(followerListQuery,userIdx);
            var followList = new Array();
            for(var i =0;i<followListRows.length;i++){
                followList[i] = followListRows[i].Id;
            }
            var List = new Array();
            for(var i=0;i<followList.length;i++){
                const [Rows] = await connection.query(selectFollowUserQuery,followList[i]);
                List[i] = Rows[0];
            }
            connection.release();
            return [List]
        }
        else if(followType === "following"){
            const followingListQuery = `select followedUserIdx as Id from follow where followingUserIdx = ?;`;
            const [followListRows] = await connection.query(followingListQuery,userIdx);
            var followList = new Array();
            for(var i =0;i<followListRows.length;i++){
                followList[i] = followListRows[i].Id;
            }
            var List = new Array();
            for(var i=0;i<followList.length;i++){
                const [Rows] = await connection.query(selectFollowUserQuery,followList[i]);
                List[i] = Rows[0];
            }
            connection.release();
            return [List]
        }
       
    } catch (error) {
        logger.error(`App - followList function error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}

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


        const insertAcitivityQuery = `insert into activity(userIdx, userId, writing, user_,profileImgUrl,followingUserIdx,followedUserIdx) values(?,?,?,?,?,?,?);`;
        const selectUserIdQuery = `select userId from user where userIdx = ?;`;
        const [selectUserIdRows] = await connection.query(selectUserIdQuery,findIdQueryRows[0].ingId);
        const userId = selectUserIdRows[0].userId;
        //const selectUserQuery = `select followingUserIdx from follow where followingUserIdx = ? && followedUserIdx = ?;`;
        //const selectUserParams = [followUserIdx,userIdx];
        //const [selectUserRows] = await connection.query(selectUserQuery,);
        const user_ = findIdQueryRows[0].edId;
        const writing = userId+"님이 회원님을 팔로우하기 시작했습니다.";
        const profileImgUrlQuery =`select profileImgUrl from user where userIdx=?;`; 
        const [profileImgUrlRows] = await connection.query(profileImgUrlQuery,findIdQueryRows[0].ingId);
        const profileImgUrl = profileImgUrlRows[0].profileImgUrl;


        if(selectFollowRows.length < 1){
            const [requestFollowRows] = await connection.query(requestFollowQuery,requestFollowParams);
            const insertAcitivityParams = [findIdQueryRows[0].ingId,userId,writing,user_,profileImgUrl,findIdQueryRows[0].ingId,findIdQueryRows[0].edId];
            const [insertAcitivityRows] = await connection.query(insertAcitivityQuery,insertAcitivityParams);
            console.log(insertAcitivityRows);
            
        } else if(selectFollowRows[0].follow === 'N'){
            const [requestFollowRows] = await connection.query(requestFollowagainQuery,requestFollowParams);

            const updateActivityQuery = `update activity set isDeleted = 'Y' where followingUserIdx =? &&followedUserIdx=?;`;
            const updateActivityParams = [findIdQueryRows[0].ingId,findIdQueryRows[0].edId];
            const updateActivityRows = await connection.query(updateActivityQuery,updateActivityParams);
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
    connection.release();
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
async function cancelFollowing(userId,userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const cancelFollowParams = [userId,userIdx];
    try {
        await connection.beginTransaction();
        const selectFollowQuery = `select follow from follow where followedUserIdx = ? && followingUserIdx = ?;`;
        const [selectFollowRows] = await connection.query(selectFollowQuery,cancelFollowParams);
        if(selectFollowRows.length < 1){

        }
        else{
            const cancelFollowQuery = `update follow set follow = 'N' where followedUserIdx = ? && followingUserIdx = ?;`;
            const [cancelFollowRows] = await connection.query(cancelFollowQuery,cancelFollowParams);

            const updateActivityQuery = `update activity set isDeleted = 'Y' where followingUserIdx =? &&followedUserIdx=?;`;
            const updateActivityParams = [userIdx,userId];
            const updateActivityRows = await connection.query(updateActivityQuery,updateActivityParams);
            await connection.commit();
            return cancelFollowRows;
        }
    } catch (error) {
        logger.error(`App - cancelFollowing Transaction Query error\n: ${JSON.stringify(error)}`);
        await connection.rollback()
    } finally{
        connection.release();
    }
    
}

//팔로워 삭제
async function cancelFollower(cancelFollowerParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectFollowQuery = `select follow from follow where followedUserIdx = ? && followingUserIdx = ?;`;
    const [selectFollowRows] = await connection.query(selectFollowQuery,cancelFollowerParams);
    if(selectFollowRows.length < 1){

    }
    else{
        const cancelFollowerQuery = `update follow set follow = 'N' where followedUserIdx = ? && followingUserIdx = ?;`;
        const [cancelFollowerRows] = await connection.query(cancelFollowerQuery,cancelFollowerParams);
        connection.release();    
        return cancelFollowerRows;
    }
}

//차단
async function userBlock(userBlockParams) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        try {
            const selectFollowQuery = `select follow from follow where followedUserIdx = ? && followingUserIdx = ?;`;
            const [selectFollowRows] = await connection.query(selectFollowQuery,userBlockParams);
            if(selectFollowRows.length < 1){

            }
            else{
                const selectisBlockedQuery = `select isBlocked from follow where followedUserIdx = ? && followingUserIdx = ?;`;
                const userBlockQuery = `update follow set isBlocked = 'Y' where followedUserIdx = ? && followingUserIdx = ?;`;
                const userBlockCancelQuery = `update follow set isBlocked = 'N' where followedUserIdx = ? && followingUserIdx = ?;`;
                const [selectisBlockedRows] = await connection.query(selectisBlockedQuery, userBlockParams);
                if(selectisBlockedRows[0].isBlocked==='Y'){
                    const [userBlockRows] = await connection.query(userBlockCancelQuery,userBlockParams);
                    return 'N';
                }
                else if(selectisBlockedRows[0].isBlocked==='N'){
                    const [userBlockRows] = await connection.query(userBlockQuery,userBlockParams);
                    return 'Y';
                }
                connection.release();
                return;
        }
        } catch (error) {
            logger.error(`App - userBlock function error\n: ${JSON.stringify(error)}`);
            connection.release();
            return false;
        }
    } catch (error) {
        logger.error(`App - userBlock connection error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
    }
}
//맞팔로우하지 않은 유저 목록
async function notFollowingUserList(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        
        const followerUserListQuery = `select followingUserIdx from follow where followedUserIdx =?;`; //해당 유저를 팔로잉
        const followingUserListQuery = `select followedUserIdx from follow where followingUserIdx = ?;`; //해당 유저가 팔로잉
        const selectNotFollowingUserQuery = `select userIdx,userId, profileImgUrl, name from user where userIdx = ?;`;
        
        const[followerUserListRows] = await connection.query(followerUserListQuery,userIdx);
        var follwerUser = new Array();
        for(var i=0; i< followerUserListRows.length;i++){
            follwerUser[i] = followerUserListRows[i].followingUserIdx;
        }

        const[followingUserListRows] = await connection.query(followingUserListQuery,userIdx);
        var followedUser = new Array();
        for(var i=0; i<followingUserListRows.length;i++){
            followedUser[i] = followingUserListRows[i].followedUserIdx;
        }
        var notFollowUser  = follwerUser.filter((user) => !followedUser.includes(user));

        var Rows = new Array();
        for(var i=0;i<notFollowUser.length;i++){
            const [notFollowingUserListRows] = await connection.query(selectNotFollowingUserQuery,notFollowUser[i]);
            Rows[i] = notFollowingUserListRows[0];
        }
        connection.release();
        return [Rows];
    } catch (error) {
        logger.error(`App - notFollowingUserList function error\n: ${JSON.stringify(error)}`);
        connection.release();
        return false;
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
    cancelFollower,
    userBlock,
    notFollowingUserList,
    followList,

}
