const { pool } = require("../../../config/database");

async function uploadFeed(userIdx, imgUrls, caption) {
    const connection = await pool.getConnection(async (conn) => conn);

    try{
        // START TRANSACTION
        await connection.beginTransaction(); 

        const uploadFeedQuery = `
                INSERT INTO feed(userIdx, caption)
                VALUES (?, ?);
                    `;
        const getCurrentFeedIdQuery = `
                SELECT MAX(id) as currentFeedId 
                FROM feed;
                    `;
        const uploadFeedImgQuery = `
                INSERT INTO feedImg(feedId, feedImgUrl)
                VALUES (?, ?);
                    `;

        const uploadFeed = await connection.query(
            uploadFeedQuery,
            [userIdx,caption]
            );
        const [getcurrentFeedId] = await connection.query(getCurrentFeedIdQuery);
        const currentFeedId = getcurrentFeedId[0].currentFeedId;
        for (var i in imgUrls){
            // 여기서 변수 정의 할 필요가 있는지? 왜하는지?
            //const uploadFeedImg = await connection.query(
                await connection.query(
                uploadFeedImgQuery,
                [currentFeedId,imgUrls[i].url]
            );
        }
        // COMMIT
        await connection.commit(); 

        return uploadFeed;
    } catch(err){
        console.log(err);
        connection.rollback()
    } finally{
        connection.release();
    }
}
//async function uploadFeed
module.exports = {
    uploadFeed
};
