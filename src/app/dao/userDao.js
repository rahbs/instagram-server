const { pool } = require("../../../config/database");

// Signup
async function userEmailCheck(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `
                SELECT userId
                FROM user 
                WHERE email = ? and isDeleted ='N';
                `;
  const selectEmailParams = [email];
  const [emailRows] = await connection.query(
    selectEmailQuery,
    selectEmailParams
  );
  connection.release();

  return emailRows;
}
async function getUserIdxbyId(userId){
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserIdxQuery = `
                SELECT userIdx 
                FROM user
                WHERE userId = ? and isDeleted = 'N';
                `;
  const selectUserIdxParams = [userId];
  const [userIdx] = await connection.query(
    selectUserIdxQuery,
    selectUserIdxParams
  );
  connection.release();

  return [userIdx];
}

async function getUserIdbyIdx(userIdx){
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserIdQuery = `
                SELECT userId
                FROM user
                WHERE userIdx = ? and isDeleted = 'N';
                `;
  const selectUserIdParams = [userIdx];
  const [userId] = await connection.query(
    selectUserIdQuery,
    selectUserIdParams
  );
  connection.release();

  return [userId];
}

async function userIdCheck(nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectNicknameQuery = `
                SELECT userId
                FROM user
                WHERE userId = ? and isDeleted = 'N';
                `;
  const selectNicknameParams = [nickname];
  const [nicknameRows] = await connection.query(
    selectNicknameQuery,
    selectNicknameParams
  );
  connection.release();
  return nicknameRows;
}

async function insertUserInfo(insertUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertUserInfoQuery = `
        INSERT INTO user(userId, password, name, email, phoneNum)
        VALUES (?, ?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );
  connection.release();
  return insertUserInfoRow;
}


async function selectUserInfobyphoneNum(phoneNum) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
  select userIdx, password, isDeleted, phoneNum from user where phoneNum = ? and isDeleted = 'N';`;

  let selectUserInfoParams = [phoneNum];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [userInfoRows];
}

async function selectUserInfobyemail(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `select userIdx, password, isDeleted, phoneNum from user where email = ? and isDeleted = 'N';`;

  let selectUserInfoParams = [email];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [userInfoRows];
}

async function selectUserInfobyuserId(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `select userIdx, password, isDeleted, phoneNum from user where userId = ? and isDeleted = 'N';`;

  let selectUserInfoParams = [userId];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [userInfoRows];
}

async function selectUserInfobyId(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
                SELECT userIdx, userId, name, email, phoneNum 
                FROM user
                WHERE userId = ? and isDeleted = 'N';
                `;

  let selectUserInfoParams = [id];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [userInfoRows];
}

async function isFollowing(userIdxA, userIdxB){
  const connection = await pool.getConnection(async (conn) => conn);
    try{
        const checkFollowingQUery = `
            select EXISTS(
                    SELECT * from follow
                    WHERE followingUserIdx = ? and followedUserIdx = ? and follow ='Y'
                   ) as exist;`;
 
        const checkFollowing = await connection.query(
            checkFollowingQUery,
            [userIdxA, userIdxB]
            );

         return checkFollowing;
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}

async function isPrivateUserIdx(userIdx){
  const connection = await pool.getConnection(async (conn) => conn);
    try{
        const checkPrivateUserIdxQuery = `
            select EXISTS(
                select * from user 
                where userIdx = ? and isPrivate = 'Y' and isDeleted = 'N'
                   ) as exist;`;
 
        const checkPrivateUserIdx = await connection.query(
            checkPrivateUserIdxQuery,
            [userIdx]
            );
            
         return checkPrivateUserIdx;
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}
//존재하는 id인지 체크
async function isExistingUserIdx(userIdx){
  const connection = await pool.getConnection(async (conn) => conn);
    try{
        const checkUserIdxQuery = `
            select EXISTS(
                select * from user 
                where userIdx = ? and isDeleted = 'N'
                   ) as exist;`;
 
        const checkUserIdx = await connection.query(
          checkUserIdxQuery,
            [userIdx]
            );
            
         return checkUserIdx;
    } catch(err){
        console.log(err);
    } finally{
        connection.release();
    }
}
async function getUserInfo(userIdx){
  const connection = await pool.getConnection(async (conn) => conn);
  try{
      const getUserInfoQeury = `
      select profileImgUrl,name as userName, userId, 
            profileWebSite,profileIntro,email,phoneNum,
            sex as gender
      from user
      where userIdx = ?`;

      const getUserInfo = await connection.query(
        getUserInfoQeury,
          [userIdx]
          );
          
       return getUserInfo;
  } catch(err){
      console.log(err);
  } finally{
      connection.release();
  }
}

async function modifyUserInfo(userIdx,profileImgUrl, userName, userId, profileWebSite, profileIntro, email, phoneNum, gender){
  const connection = await pool.getConnection(async (conn) => conn);
  try{
      const modifyProfileImgQUery = `update user set profileImgUrl = ? where userIdx = ?`;
      const modifyUserNameQUery = `update user set name = ? where userIdx = ?`;
      const modifyuserIdQUery = `update user set userId = ? where userIdx = ?`;
      const modifyprofileWebSiteQUery = `update user set profileWebSite = ? where userIdx = ?`;
      const modifyprofileIntroQUery = `update user set profileIntro = ? where userIdx = ?`;
      const modifyEmailQUery = `update user set email = ? where userIdx = ?`;
      const modifyPhoneNumQUery = `update user set phoneNum = ? where userIdx = ?`;
      const modifyGenderQuery= `update user set sex = ? where userIdx = ?`;
      if (profileImgUrl) await connection.query( modifyProfileImgQUery,[profileImgUrl, userIdx] );
      if (userName) await connection.query( modifyUserNameQUery,[userName, userIdx] );
      if (userId) await connection.query( modifyuserIdQUery,[userId, userIdx] );
      if (profileWebSite) await connection.query( modifyprofileWebSiteQUery,[profileWebSite, userIdx] );
      if (profileIntro) await connection.query( modifyprofileIntroQUery,[profileIntro, userIdx] );
      if (email) await connection.query( modifyEmailQUery,[email, userIdx] );
      if (phoneNum) await connection.query( modifyPhoneNumQUery,[phoneNum, userIdx] );
      if (gender) await connection.query( modifyGenderQuery,[gender, userIdx] );

  } catch(err){
      console.log(err);
  } finally{
      connection.release();
  }
}

async function getAccountType(userIdx){
  const connection = await pool.getConnection(async (conn) => conn);
  try{
      const query = `select isPrivate from user where userIdx = ?`;

      const res = await connection.query( query,[userIdx]);
          
      return res;
  } catch(err){
      console.log(err);
  } finally{
      connection.release();
  }
}
async function changeAccountType(userIdx){
  const connection = await pool.getConnection(async (conn) => conn);
  try{
      const [isPrivate] = await getAccountType(userIdx);
      if(isPrivate[0].isPrivate=='Y'){
        const query = `update user set isPrivate = 'N' where userIdx = ?`;
        await connection.query(query,[userIdx])
        }
      else if(isPrivate[0].isPrivate=='N'){
        const query = `update user set isPrivate = 'Y' where userIdx = ?`;
        await connection.query(query,[userIdx])
      }

      const res = await getAccountType(userIdx);
      return res;
  } catch(err){
      console.log(err);
  } finally{
      connection.release();
  }
}
// 유저검색



module.exports = {
  userEmailCheck,
  userIdCheck,
  insertUserInfo,
  selectUserInfobyphoneNum,
  selectUserInfobyemail,
  selectUserInfobyuserId,
  selectUserInfobyId,
  getUserIdxbyId,
  isFollowing,
  isPrivateUserIdx,
  isExistingUserIdx,
  getUserInfo,
  modifyUserInfo,
  getUserIdbyIdx,
  getAccountType,
  changeAccountType
};
