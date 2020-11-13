const { pool } = require("../../../config/database");

async function uploadStory(userIdx, imgUrl, closeFriend) {
    const connection = await pool.getConnection(async (conn) => conn);
    try{

        const uploadQuery = `
                INSERT INTO story_(userIdx, imgUrl)
                VALUES (?, ?);
                    `;
        const setColoseFriendQuery = `
                UPDATE story_ SET closeFriend = 'Y';`;

        await connection.query(
            uploadQuery,
            [userIdx,imgUrl]
            );
        if(closeFriend)
            await connection.query(setColoseFriendQuery,[]);
        
    } catch(err){
        console.log(err);

    } finally{
        connection.release();
    }
}

//존재하는 storyId인지 체크
async function checkStoryId(storyId){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const query = `
            select EXISTS(
                select * from story_
                where id = ? and isDeleted = 'N'
                    ) as exist;`;

        const res = await connection.query(query, [storyId]);
        return res;
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}

async function deleteStory(storyId){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const query = `update story_ set isDeleted = 'Y' where id = ? and isDeleted = 'N'`;
        await connection.query(query,[storyId]);
  
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}
async function getUserIdxOfStory(storyId){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const query = `select userIdx from story_ where id = ? and isDeleted='N'`;
        const userIdx = await connection.query(query,[storyId]);
        return userIdx;
  
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}
// 24시간이 지나지 않은 스토리인지 확인
async function isValidStory(storyId){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const query = `select exists(select id 
                        from story_ 
                        where TIMESTAMPDIFF(hour,story_.createdAt,now())<24 and id = ?) as exist;`;
        const userIdx = await connection.query(query,[storyId]);
        return userIdx;
  
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}
async function checkReadStory(storyId, userIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const query = `select exists(select storyId from viewStory where storyId = ? and userIdx =?) as exist;`;
        const checkReadStory = await connection.query(query,[storyId, userIdx]);
        return checkReadStory;

    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}
async function getStoryDetail(storyId,userIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        // START TRANSACTION
        await connection.beginTransaction(); 
        
        const getStoryDetailquery = `select user.userIdx, imgUrl, userId, profileImgUrl,
                            CASE
                                WHEN TIMESTAMPDIFF(minute,story_.createdAt,now()) < 60
                                THEN CONCAT(TIMESTAMPDIFF(minute,story_.createdAt,now()),'분')
                                ELSE CONCAT(TIMESTAMPDIFF(hour,story_.createdAt,now()),'시간')
                            END AS time,
                            ?-1 as previousStoryId, ?+1 as nextStoryId
                        from user
                        join story_
                        on user.userIdx = story_.userIdx
                        where user.isDeleted = 'N' and story_.isDeleted='N' and story_.id = ?;`;
        const updateStoryViewquery = 'INSERT INTO viewStory(storyId, userIdx) VALUES(?,?);';

        const [imgUrl] = await connection.query(getStoryDetailquery,[storyId,storyId,storyId]);
        //이미 읽은 스토리이면, 업데이트 안한다.
        const [checkStory] = await checkReadStory(storyId,userIdx);
        if(!checkStory[0].exist)
            await connection.query(updateStoryViewquery,[storyId, userIdx]);
        
        // COMMIT
        await connection.commit(); 

        return imgUrl;
    } catch(err){
        console.log(err);
        connection.rollback()
    } finally{
        connection.release();
    }
}
async function getStoryImgUrl(storyId){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const query = `select imgUrl as storyImgUrl from story_ where id = ?;`;
        const [res] = await connection.query(query,[storyId]);
        return res;

    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}
async function getStoryReaders(storyId){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const query = `select user.userIdx, userId, name, profileImgUrl
                        from viewStory
                        join user
                        on viewStory.userIdx = user.userIdx
                        where storyId = ?;`;
        const [res] = await connection.query(query,[storyId]);
        return res;

    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}
// userIdxA가 userIdxB의 스토리를 모두 확인했는지 체크 (볼 스토리가 남아있으면:true 없으면:false)
async function getStoryStatus(userIdxA,userIdxB){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const query1 = `select count(*) as seenStories
                        from viewStory
                        join story_
                        on viewStory.storyId = story_.id
                        where story_.userIdx = 29 and viewStory.userIdx = 27;`;
        const query2 = `select count(*) as stories from story_ where userIdx = 29`
        
        const [seenStoryCount] = await connection.query(query1,[userIdxB,userIdxA]);
        const [storyCount] = await connection.query(query2,[userIdxB])
        if(seenStoryCount[0].seenStories < storyCount[0].stories )
            return true
        else return false
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}


async function getStoryUsers(userIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const query1 = `select  story_.id as storyId, profileImgUrl
                        from story_
                        join user
                        on story_.userIdx = user.userIdx
                        where user.userIdx = ?
                        limit 1;`;
        const query2 = `select user.userIdx, profileImgUrl, userId,story_.id as storyId from story_
                        join
                            (select followedUserIdx
                            from follow
                            where followingUserIdx = ?) as follow
                        on follow.followedUserIdx = story_.userIdx
                        join user
                        on story_.userIdx = user.userIdx
                        limit 1`;
        
        const [mystory] = await connection.query(query1,[userIdx]);
        let [friendstories] = await connection.query(query2,[userIdx]);
        
        const myStoryStatus = await getStoryStatus(userIdx, userIdx);
        mystory[0].storyStatus = myStoryStatus;  
        myStory = mystory[0]
        for (friendstory of friendstories){
            let storyStatus = await getStoryStatus(userIdx, friendstory.userIdx);
            friendstory.storyStatus = storyStatus;
        }
        res = {myStory, friendstories};
        return res;

    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}


module.exports = {
    uploadStory,
    deleteStory,
    getUserIdxOfStory,
    checkStoryId,
    getStoryDetail,
    isValidStory,
    checkReadStory,
    getStoryImgUrl,
    getStoryReaders,
    getStoryStatus,
    getStoryUsers
};
