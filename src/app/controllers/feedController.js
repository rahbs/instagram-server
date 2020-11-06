const {pool} = require('../../../config/database');
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
            profilImgUrl : getUserInfo[0].profileImgUrl,
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
    const selectedUserIdx = req.query.userIdx;

    // query string으로 들어온 usrIdx가 valid한지 체크
    const [isExistingUserIdx] = await userDao.isExistingUserIdx(selectedUserIdx);
    if(selectedUserIdx && !isExistingUserIdx[0].exist){
        return res.json({
            result: {},
            isSuccess: false,
            code: 201,
            message: "query string로 들어온 usrIdx가 존재하지 않습니다."
        });
    }
    try{
        // getUserInfo
        const getFeeds = await feedDao.getFeeds(userIdx,selectedUserIdx);
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