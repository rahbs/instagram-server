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
module.exports = {
    uploadStory,
    deleteStory,
    getUserIdxOfStory,
    checkStoryId
};
