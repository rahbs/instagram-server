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
        console.log(closeFriend);
        if(closeFriend)
            await connection.query(setColoseFriendQuery,[]);

    } catch(err){
        console.log(err);

    } finally{
        connection.release();
    }
}
module.exports = {
    uploadStory
};
