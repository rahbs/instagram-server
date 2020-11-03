const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const feedDao = require('../dao/feedDao');
const userDao = require('../dao/userDao');

exports.uploadFeed = async function (req, res) {
    const {
        imgUrls, caption
        } = req.body;
    if(!imgUrls) return res.json({isSuccess: false, code: 300, message: "imgUrls에 값이 없습니다."});
    
    try {
        const userId = req.verifiedToken.id;
        console.log(userId)

        const [userIdx] = await userDao.getUserIdxbyId(userId);
        const insertFeed = await feedDao.uploadFeed(userIdx[0].userIdx, imgUrls, caption);

        return res.json({
            isSuccess: true,
            code: 200,
            message: "게시물이 성공적으로 등록되었습니다"
        });
    } catch (err) {
        //connection.release();
        logger.error(`App - upload Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }    
};