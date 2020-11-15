const {logger} = require('../../../config/winston');

const feedDao = require('../dao/feedDao');
//const { isFollowing, isPrivateUserIdx } = require('../dao/userDao');
const userDao = require('../dao/userDao');

exports.uploadFeed = async function (req, res) {
    const {
        imgUrls, caption
        } = req.body;
    if(!imgUrls) return res.json({isSuccess: false, code: 300, message: "imgUrls에 값이 없습니다."});
    
    try {
        const userIdx = req.verifiedToken.id;
        //const [userIdx] = await userDao.getUserIdxbyId(userId);
        const insertFeed = await feedDao.uploadFeed(userIdx, imgUrls, caption);
        return res.json({
            isSuccess: true,
            code: 200,
            message: "게시물이 성공적으로 등록되었습니다"
        });
    } catch (err) {
        logger.error(`App - uploadFeed Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }    
};

exports.getUserFeed = async function (req, res){
    const userIdx = req.verifiedToken.id;
    //const [userIdx] = await userDao.getUserIdxbyId(userId); // 현재 사용자의 userIdx
    const userIdxOfFeed = req.params['userIdx']; // 조회하려는 피드를 소유한 usrIdx
    // path variable로 들어온 usrIdx가 valid한지 체크
    const [isExistingUserIdx] = await userDao.isExistingUserIdx(userIdxOfFeed);
    if(!isExistingUserIdx[0].exist){
        return res.json({
            result: {},
            isSuccess: false,
            code: 201,
            message: "path variable로 들어온 usrIdx가 존재하지 않습니다."
        });
    }
    // console.log('userIdx: ',userIdx[0].userIdx );
    // console.log('userIdxOfFeed: ',userIdxOfFeed);

    //set reation variable
    let relation;
    const [isFollowing] = await userDao.isFollowing(userIdx,userIdxOfFeed);
    const [isPrivateUserIdx] = await userDao.isPrivateUserIdx(userIdxOfFeed);
    if (userIdx == userIdxOfFeed) //내 계정:A
        relation = 'A';
    else if(isFollowing[0].exist) //팔로잉하는 계정:B
        relation = 'B';
    else if(!isPrivateUserIdx[0].exist) //팔로잉x and 공개계정:C
        relation = 'C';
    else // 팔로잉x and 비공개계정:D
        relation = 'D';

    try{
        // getUserInfo
        const [getUserInfo] = await feedDao.getUserInfo(userIdxOfFeed);

        let feedList;
        if(relation == 'D')
            feedList = [];
        else
            [feedList] = await feedDao.getUserFeedList(userIdxOfFeed);
        
        userInfo = {
            relation : relation,
            profileImgUrl : getUserInfo[0].profileImgUrl,
            userId : getUserInfo[0].userId,
            userName : getUserInfo[0].userName,
            profileIntro : getUserInfo[0].profileIntro,
            profileWebSite : getUserInfo[0].profileWebSite,
            followingNum : getUserInfo[0].followingNum,
            followerNum : getUserInfo[0].followerNum,
            feedNum : getUserInfo[0].feedNum
        }
        result = {userInfo, feedList};
        return res.json({
            result: result,
            isSuccess: true,
            code: 200,
            message: "UserFeed가 성공적으로 조회되었습니다."
        });
    } catch (err){
    logger.error(`App - getUserFeed Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
    }
};

exports.getFeeds = async function (req, res){
    const userIdx = req.verifiedToken.id;

    try{
        // getUserInfo
        const getFeeds = await feedDao.getFeeds(userIdx);
        return res.json({
            result: getFeeds,
            isSuccess: true,
            code: 200,
            message: "Feeds가 성공적으로 조회되었습니다."
        });
    } catch (err){
    logger.error(`App - getFeeds Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
    }
};

exports.deleteFeed = async function (req, res){
    const userIdx = req.verifiedToken.id; // 현재 사용자의 userIdx
    const feedId = req.params['feedId']; // path variable로 들어온 feedId
    // path variable로 들어온 feedId가 존재하는 feedId인지 체크
    const [isExistingFeedId] = await feedDao.checkFeedId(feedId);
    
    if(!isExistingFeedId[0].exist){
        return res.json({
            isSuccess: false,
            code: 300,
            message: "존재하지 않는 피드입니다."
        });
    }
    // path variable로 들어온 feedId가 현재 로그인된 사용자의 피드인지 체크
    const [userIdxOfFeed] = await feedDao.getUserIdxOfFeed(feedId);
    if(userIdxOfFeed[0].userIdx != userIdx){
        return res.json({
            isSuccess: false,
            code: 301,
            message: "사용자의 feedId가 아닙니다.(로그인된 유저의 피드만 삭제가능)"
        });
    }
    try{
        await feedDao.deleteFeed(feedId);
        return res.json({
            isSuccess: true,
            code: 200,
            message: "피드가 성공적으로 삭제되었습니다."
        });
    } catch (err){
    logger.error(`App - deleteFeed Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
    }
};
    
exports.modifyFeed = async function (req, res){
    const {caption} = req.body;
    const userIdx = req.verifiedToken.id; // 현재 사용자의 userIdx
    const feedId = req.params['feedId']; // path variable로 들어온 feedId
    // path variable로 들어온 feedId가 존재하는 feedId인지 체크
    const [isExistingFeedId] = await feedDao.checkFeedId(feedId);
    if(!caption){
        return res.json({
            isSuccess: false,
            code: 302,
            message: "body에 caption을 입력해 주세요"
        });
    }
    if(!isExistingFeedId[0].exist){
        return res.json({
            isSuccess: false,
            code: 300,
            message: "존재하지 않는 피드입니다."
        });
    }
    // path variable로 들어온 feedId가 현재 로그인된 사용자의 피드인지 체크
    const [userIdxOfFeed] = await feedDao.getUserIdxOfFeed(feedId);
    if(userIdxOfFeed[0].userIdx != userIdx){
        return res.json({
            isSuccess: false,
            code: 301,
            message: "사용자의 feedId가 아닙니다.(로그인된 유저의 피드만 삭제가능)"
        });
    }
    try{
        await feedDao.modifyFeed(feedId,caption);
        return res.json({
            isSuccess: true,
            code: 200,
            message: "피드가 성공적으로 수정되었습니다."
        });
    } catch (err){
    logger.error(`App - modifyFeed Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
    }
};
    

exports.getFeedDetail = async function (req, res){
    const userIdx = req.verifiedToken.id;
    const feedId = req.params['feedId'];
    // path variable로 들어온 feedId가 존재하는 feedId인지 체크
    const [isExistingFeedId] = await feedDao.checkFeedId(feedId);
    if(!isExistingFeedId[0].exist){
        return res.json({
            isSuccess: false,
            code: 300,
            message: "존재하지 않는 피드입니다."
        });
    }
    // 팔로우하지 않고, 비공계 계정일 경우
    const [userIdxOfFeed] = await feedDao.getUserIdxOfFeed(feedId);
    const [isFollowing] = await userDao.isFollowing(userIdx,userIdxOfFeed[0].userIdx);
    const [isPrivateUserIdx] = await userDao.isPrivateUserIdx(userIdxOfFeed[0].userIdx)
    if(!isFollowing[0].exist && isPrivateUserIdx[0].exist){
        return res.json({
            isSuccess: false,
            code: 301,
            message: "비공계계정의 피드입니다."
        });
    }
    try{
        const getFeeds = await feedDao.getFeedDetail(userIdx,feedId);
        return res.json({
            result: getFeeds,
            isSuccess: true,
            code: 200,
            message: "Feed가 성공적으로 조회되었습니다."
        });
    } catch (err){
    logger.error(`App - getFeedDetail Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
    }
};