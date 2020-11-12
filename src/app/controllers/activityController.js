const {logger} = require('../../../config/winston');

const activityDao = require('../dao/activityDao');
//const { isFollowing, isPrivateUserIdx } = require('../dao/userDao');
const userDao = require('../dao/userDao');

exports.selectActivity = async function (req, res) {

    try {
        const userIdx = req.verifiedToken.id;
        
        const selectActivityRows = await activityDao.selectActivity(userIdx);
        console.log(selectActivityRows);
        return res.json({
            list : selectActivityRows,
            isSuccess: true,
            code: 200,
            message: "활동 조회 성공"
        });
    } catch (err) {
        logger.error(`App - selectActivity Query error\n: ${JSON.stringify(error)}`);
        
    }    
};

