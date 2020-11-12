const {logger} = require('../../../config/winston');

const storyDao = require('../dao/storyDao');
const userDao = require('../dao/userDao');

exports.uploadStory = async function (req, res) {
    const {imgUrl,closeFriend} = req.body;
    if(!imgUrl) return res.json({isSuccess: false, code: 300, message: "imgUrl에 값이 없습니다."});
    if(closeFriend!='Y' && closeFriend!='N') return res.json({isSuccess: false, code: 301, message: "closeFriend에 잘못된 값이 들어왔습니다. (Y 혹은 N만 가능)"});
    try {
        const userIdx = req.verifiedToken.id;
        await storyDao.uploadStory(userIdx, imgUrl, closeFriend);
        return res.json({
            isSuccess: true,
            code: 200,
            message: "스토리가 성공적으로 등록되었습니다"
        });
    } catch (err) {
        logger.error(`App - uploadStory Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }    
};

exports.deleteStory = async function (req, res){
    const userIdx = req.verifiedToken.id; // 현재 사용자의 userIdx
    const storyId = req.params['storyId']; // path variable로 들어온 storyId
    // path variable로 들어온 storyId가 존재하는 storyId인지 체크
    const [isExistingStoryId] = await storyDao.checkStoryId(storyId);
    
    if(!isExistingStoryId[0].exist){
        return res.json({
            isSuccess: false,
            code: 300,
            message: "존재하지 않는 스토리입니다."
        });
    }
    // path variable로 들어온 storyId가 현재 로그인된 사용자의 스토리인지 체크
    const [userIdxOfStory] = await storyDao.getUserIdxOfStory(storyId);
    if(userIdxOfStory[0].userIdx != userIdx){
        return res.json({
            isSuccess: false,
            code: 301,
            message: "사용자의 storyId가 아닙니다.(로그인된 유저의 피드만 삭제가능)"
        });
    }
    try{
        await storyDao.deleteStory(storyId);
        return res.json({
            isSuccess: true,
            code: 200,
            message: "스토리가 성공적으로 삭제되었습니다."
        });
    } catch (err){
    logger.error(`App - deleteStory Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
    }
};
