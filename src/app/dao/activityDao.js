const { pool } = require("../../../config/database");


//팔로우 요청
async function selectActivity(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const selectActivityQuery = `select userIdx,profileImgUrl,writing,
        case
            when timestampdiff(second,createdAt,now())<60
                then concat(timestampdiff(second,now(),createdAt),'초')
            when timestampdiff(second,createdAt,now())>=60 && timestampdiff(second,createdAt,now())<3600
                then concat(timestampdiff(minute,createdAt,now()),'분')
             when timestampdiff(second,createdAt,now())>=3600 && timestampdiff(second,createdAt,now())<86400
                    then concat(timestampdiff(hour,createdAt,now()),'시간')
             when timestampdiff(second,createdAt,now())>=86400 && timestampdiff(second,createdAt,now())<604800
                 then concat(timestampdiff(day,createdAt,now()),'일')
              when timestampdiff(second,createdAt,now())>=604800 && timestampdiff(second,createdAt,now())<3153600
                  then concat(timestampdiff(week,createdAt,now()),'주')
                  end as created,
        feedId,commentId from activity
 where isDeleted = 'N'&& user_ = ?
 order by createdAt desc;`;
        const [selectActivityRows] = await connection.query(selectActivityQuery,userIdx);
        return selectActivityRows;
    } catch (error) {
        console.log(error);
        logger.error(`App - selectActivity function error\n: ${JSON.stringify(error)}`);
    } finally{
        connection.release();
    }
    
}



module.exports = {
    selectActivity

}
