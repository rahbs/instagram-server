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
            SELECT profileImgUrl, user.userIdx as userIdx, user.userId as userId, user.name as userName,
                    profileIntro, profileWebSite,followingNum, followerNum, feedNum
            FROM
                (SELECT profileImgUrl, userIdx, userId, name, profileIntro, profileWebSite
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

async function getFeeds(userIdx,selectedUserIdx){
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        let getFeedInfoQuery = `
        SELECT feedId_, a.userIdx as userIdx, user.userId as userId, user.profileImgUrl as profileImgUrl,
                likeUser.profileImgUrl as likeUserProfileImgUrl, location,caption, commentNum,
                CASE
                    WHEN likeCheck.feedId is not null
                    THEN true
                    ELSE false
                END AS isLiked, likeUser.userId as likeUserId, likeNum
        #        CASE
        #             WHEN numLikedFollowingUser > 0 and a.likeNum = 1
        #             THEN CONCAT(likeUser.userId,'님이 좋아합니다')
        #             WHEN numLikedFollowingUser > 0 and a.likeNum > 1
        #             THEN CONCAT(likeUser.userId,'님 외 ', a.likeNum-1,'명이 좋아합니다.') # + '명이 좋아합니다.'
        #             ELSE CONCAT ('좋아요 ',likeNum,'개')
        #        END AS likeNum
        from
            (SELECT feed.id as feedId_,feed.userIdx,feed.location, feed.caption, COUNT(heart.feedId) as likeNum
            FROM feed
            LEFT JOIN (select * from heart where status = 'F' and isLiked = 'Y') as heart
                ON heart.feedId = feed.id
            LEFT JOIN (select * from follow where follow = 'Y' and followingUserIdx = ?) as follow
                ON heart.userIdx = follow.followedUserIdx
            WHERE feed.userIdx IN (SELECT followedUserIdx from follow where follow = 'Y' and followingUserIdx = ?
            UNION
            SELECT ? AS followedUserIdx)
            GROUP BY (feed.id)) as a
        LEFT JOIN
                (SELECT feed.id as feedId__, heart.userIdx  as likedFollowingUserIdx,COUNT( heart.userIdx) as numLikedFollowingUser
                FROM feed
                LEFT JOIN (select * from heart where status = 'F' and isLiked = 'Y') as heart
                    ON heart.feedId = feed.id
                JOIN (SELECT followedUserIdx from follow where follow = 'Y' and followingUserIdx = ? 
                        UNION
                        SELECT ? AS followedUserIdx) as follow
                    ON heart.userIdx = follow.followedUserIdx
                GROUP BY (feed.id)) as likefollower
            ON a.feedId_ = likefollower.feedId__
        LEFT JOIN (SELECT userId, profileImgUrl, userIdx from user) as likeUser
            ON likeUser.userIdx = likedFollowingUserIdx
        LEFT JOIN (SELECT userId, profileImgUrl, userIdx from user) as user
            ON user.userIdx = a.userIdx
        LEFT JOIN (SELECT feedId
            FROM heart
            WHERE heart.userIdx = ? and isLiked = 'Y')as likeCheck
            ON a.feedId_ = likeCheck.feedId
        LEFT JOIN
                (SELECT feed.id as feedId, COUNT(comment.feedId) as commentNum
                FROM feed
                LEFT JOIN comment
                    ON comment.feedId = feed.id
                GROUP BY (feed.id)) as comment
            ON comment.feedId = a.feedId_
                    `;
        const getFeedImgUrls = `
        select feedImgUrl as imgUrl
        from feed
        join feedImg
        on feed.id = feedImg.feedId
        where feed.id = ?;
                    `;
        if(selectedUserIdx) 
            getFeedInfoQuery = getFeedInfoQuery + ` WHERE a.userIdx = ${selectedUserIdx}`;
        getFeedInfoQuery = getFeedInfoQuery+ ';';
        const [feedInfoList] = await connection.query(
            getFeedInfoQuery,
            [userIdx,userIdx,userIdx,userIdx,userIdx,userIdx]
            );

        let result = []
        for(feedInfo of feedInfoList){
            feedInfo['feedId'] = feedInfo['feedId_'];
            delete feedInfo['feedId_'];
            feedId = feedInfo['feedId'];
            let [feedImgUrls] = await connection.query(
                getFeedImgUrls,
                [feedId]
            )
            result.push({feedInfo,feedImgUrls});
        }
        
        return result;
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
    getUserFeedList,
    getFeeds
};
