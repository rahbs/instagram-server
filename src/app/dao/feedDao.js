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
// 개인 피드에서 사용자 정보
async function getUserInfo(userIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const getUserInfoQuery = `
            SELECT user.userIdx as userIdx, user.userId as userId, user.name as userName,
                    profileIntro, profileWebSite,followingNum, followerNum, feedNum
            FROM
                (SELECT userIdx, userId, name, profileIntro,profileWebSite
                    FROM user) as user
            JOIN
                (SELECT user.userIdx, userId, COUNT(feed.userIdx) as feedNum
                    FROM user
                    LEFT JOIN feed
                    ON user.userIdx = feed.userIdx
                GROUP BY user.userIdx) as feedNum
            ON user.userIdx = feedNum.userIdx
            JOIN
                (SELECT user.userIdx, COUNT(follow.followingUserIdx) as followingNum
                    FROM user
                    LEFT JOIN follow
                    ON user.userIdx = follow.followingUserIdx
                GROUP BY user.userIdx) as followingNum
            ON user.userIdx = followingNum.userIdx
            JOIN
                (SELECT user.userIdx, COUNT(follow.followedUserIdx) as followerNum
                    FROM user
                    LEFT JOIN follow
                    ON user.userIdx = follow.followedUserIdx
                GROUP BY user.userIdx) as followedNum
            ON user.userIdx = followedNum.userIdx
            WHERE user.userIdx = ?;
                    `;

        const getUserInfo = await connection.query(
            getUserInfoQuery,
            [userIdx]
            );
         return getUserInfo;
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}

async function getUserFeedList(userIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        const getUserFeedListQuery = `
        SELECT feed.id as feedId, feedImgUrl,
        CASE
            WHEN count(*) > 1
            THEN true
            ELSE false
            END AS isMultiple
        FROM feed
        JOIN feedImg
        ON feed.id = feedImg.feedId
        WHERE feed.userIdx = ? and feed.isDeleted = 'N'
        GROUP by feed.id;
                    `;

        const getUserFeedList = await connection.query(
            getUserFeedListQuery,
            [userIdx]
            );
         return getUserFeedList;
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }    
}

//async function uploadFeed
module.exports = {
    uploadFeed,
    getUserInfo,
    getUserFeedList
};
