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
// async function getStoryUsers(userIdx){
    // const connection = await pool.getConnection(async (conn) => conn);
    // try{
    //     const query1 = `select exists(select storyId from viewStory where storyId = ? and userIdx =?) as exist;`;
    //     const res = await connection.query(query,[storyId, userIdx]);
    //     return res;

    // } catch(err){
    //     console.log(err);
    // } finally{
    //     connection.release();
    // }
// }

module.exports = {
    uploadStory,
    deleteStory,
    getUserIdxOfStory,
    checkStoryId,
    getStoryDetail,
    isValidStory,
    checkReadStory,
    //getStoryUsers
};
