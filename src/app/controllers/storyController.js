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
