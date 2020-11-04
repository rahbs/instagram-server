const { pool } = require("../../../config/database");

// Signup
async function userEmailCheck(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `
                SELECT userId
                FROM userInfo 
                WHERE email = ?;
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
                FROM userInfo 
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

async function userIdCheck(nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectNicknameQuery = `
                SELECT userId
                FROM userInfo 
                WHERE userId = ?;
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
        INSERT INTO userInfo(userId, password, userName, email, phoneNum)
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
  select userIdx, password, isDeleted, phoneNum from user where phoneNum = ?;`;

  let selectUserInfoParams = [phoneNum];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  return [userInfoRows];
}




//SignIn
// async function selectUserInfo(email) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const selectUserInfoQuery = `
//                 SELECT id, email , pswd, nickname, status 
//                 FROM UserInfo 
//                 WHERE email = ?;
//                 `;

//   let selectUserInfoParams = [email];
//   const [userInfoRows] = await connection.query(
//     selectUserInfoQuery,
//     selectUserInfoParams
//   );
//   return [userInfoRows];
// }

module.exports = {
  userEmailCheck,
  userIdCheck,
  insertUserInfo,
  //selectUserInfo,
  selectUserInfobyphoneNum,
};
