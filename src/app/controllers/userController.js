const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const userDao = require('../dao/userDao');
const { constants } = require('buffer');

exports.signUp = async function (req, res) {
    const {
        id, name, password, email, phoneNum
    } = req.body;
    if (!id) return res.json({isSuccess: false, code: 300, message: "id를 입력해 주세요"});
    if (!name) return res.json({isSuccess: false, code: 301, message: "name을 입력해 주세요"});
    if (!password) return res.json({isSuccess: false, code: 302, message: "password를 입력해 주세요"});
    if (!phoneNum && !email) return res.json({isSuccess: false, code: 303, message: "email과 phoneNum 중 하나는 입력해주세요"});
    if (email && email.length > 30) return res.json({
        isSuccess: false,
        code: 304,
        message: "이메일은 30자리 미만으로 입력해주세요"
    });
    if (email && !regexEmail.test(email)) return res.json({isSuccess: false, code: 305, message: "올바르지 않은 email 형식입니다"});
    const regexPwd = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{6,20}$/;
    // if (password.length < 6 || password.length > 20) return res.json({
    if (!regexPwd.test(password)) return res.json({
        isSuccess: false,
        code: 306,
        message: "비밀번호는 6~20자리의 영문 숫자조합이어야 합니다."

    });
    const regexPhoneNum = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/;
    if (phoneNum && !regexPhoneNum.test(phoneNum)) return res.json({
        isSuccess: false,
        code: 307,
        message: "phoneNum 형식이 맞지 않습니다 (ex: 01012341234)"

    });
    
    try {
        try {
            // id 중복 확인
            const idRows = await userDao.userIdCheck(id);
            if (idRows.length > 0) {
                return res.json({
                    isSuccess: false,
                    code: 401,
                    message: "중복된 id입니다"
                });
            }
            // 회원 가입
            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            const insertUserInfoParams = [id, hashedPassword, name, email, phoneNum];
            const insertUserRows = await userDao.insertUserInfo(insertUserInfoParams);   
            
            const [userInfoRows] = await userDao.selectUserInfobyId(id)
            
            //토큰 생성
            let token = await jwt.sign({
                id: userInfoRows[0].userId,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀 키
            {
                expiresIn: '365d',
                subject: 'userInfo',
            } // 유효 시간은 365일
        );
         
            // 회원 가입 성공
            return res.json({
                result: {userIdx: userInfoRows[0].userIdx,jwt: token},
                isSuccess: true,
                code: 200,
                message: "회원가입 성공"
            });

        } catch (err) {
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`App - SignUp DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};
// exports.getUserInfo = async function (req, res) {
//     const decodedToken = req.verifiedToken;
//     decodedToken.id
// }
/**
 update : 2020.10.4
 01.signUp API = 회원가입
 */
exports.signUpTemplate = async function (req, res) {
    const {
        email, password, nickname
    } = req.body;

    if (!email) return res.json({isSuccess: false, code: 301, message: "이메일을 입력해주세요."});
    if (email.length > 30) return res.json({
        isSuccess: false,
        code: 302,
        message: "이메일은 30자리 미만으로 입력해주세요."
    });

    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 303, message: "이메일을 형식을 정확하게 입력해주세요."});

    if (!password) return res.json({isSuccess: false, code: 304, message: "비밀번호를 입력 해주세요."});
    if (password.length < 6 || password.length > 20) return res.json({
        isSuccess: false,
        code: 305,
        message: "비밀번호는 6~20자리를 입력해주세요."
    });

    if (!nickname) return res.json({isSuccess: false, code: 306, message: "닉네임을 입력 해주세요."});
    if (nickname.length > 20) return res.json({
        isSuccess: false,
        code: 307,
        message: "닉네임은 최대 20자리를 입력해주세요."
    });

    try {
        try {
            // 이메일 중복 확인
            const emailRows = await userDao.userEmailCheck(email);
            if (emailRows.length > 0) {

                return res.json({
                    isSuccess: false,
                    code: 308,
                    message: "중복된 이메일입니다."
                });
            }

            // 닉네임 중복 확인
            const nicknameRows = await userDao.userNicknameCheck(nickname);
            if (nicknameRows.length > 0) {
                return res.json({
                    isSuccess: false,
                    code: 309,
                    message: "중복된 닉네임입니다."
                });
            }

            // TRANSACTION : advanced
           // await connection.beginTransaction(); // START TRANSACTION
            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            const insertUserInfoParams = [email, hashedPassword, nickname];
            
            const insertUserRows = await userDao.insertUserInfo(insertUserInfoParams);

          //  await connection.commit(); // COMMIT
           // connection.release();
            return res.json({
                isSuccess: true,
                code: 200,
                message: "회원가입 성공"
            });
        } catch (err) {
           // await connection.rollback(); // ROLLBACK
           // connection.release();
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`App - SignUp DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/**
 update : 2020.11.5
 04.signIn API = 로그인
 **/
exports.signIn = async function (req, res) {
    const {
        Id, password
    } = req.body;




    if (!Id) return res.json({isSuccess: false, code: 301, message: "번호 혹은 이메일, 닉네임을 입력해주세요."});
    

    if (!password) return res.json({isSuccess: false, code: 304, message: "비밀번호를 입력 해주세요."});
    // const regexPhoneNum = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/;
    // if(regexEmail.test(Id))res.json({isSuccess: true});
    // else if(regexPhoneNum.test(Id))res.json({isSuccess:true});
    // else res.json({isSuccess:false});
    
        try {
            const regexPhoneNum = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/;
            if(regexPhoneNum.test(Id))
            {
                const [userInfoRows] = await userDao.selectUserInfobyphoneNum(Id);
            if (userInfoRows.length < 1) {
                return res.json({
                    isSuccess: false,
                    code: 310,
                    message: "없는 아이디거나 비밀번호가 틀렸습니다."
                });
            }

            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            if (userInfoRows[0].password !== hashedPassword) {
                return res.json({
                    isSuccess: false,
                    code: 310,
                    message: "없는 아이디거나 비밀번호가 틀렸습니다."
                });
            }
            if (userInfoRows[0].isDeleted === "Y") {
                return res.json({
                    isSuccess: false,
                    code: 312,
                    message: "탈퇴 된 계정입니다. 고객센터에 문의해주세요."
                });
            }
            //토큰 생성
            let token = await jwt.sign({
                    id: userInfoRows[0].userIdx,
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
            );

            res.json({
                //userInfo: userInfoRows[0].userID,
                jwt: token,
                isSuccess: true,
                code: 200,
                message: "로그인 성공"
            });
            }

           else if(regexEmail.test(Id)){
                const [userInfoRows] = await userDao.selectUserInfobyemail(Id);
                if (userInfoRows.length < 1) {
                    return res.json({
                        isSuccess: false,
                        code: 310,
                        message: "없는 아이디거나 비밀번호가 틀렸습니다."
                    });
                }
    
                const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
                if (userInfoRows[0].password !== hashedPassword) {
                    return res.json({
                        isSuccess: false,
                        code: 310,
                        message: "없는 아이디거나 비밀번호가 틀렸습니다."
                    });
                }
                if (userInfoRows[0].isDeleted === "Y") {
                    return res.json({
                        isSuccess: false,
                        code: 312,
                        message: "탈퇴 된 계정입니다. 고객센터에 문의해주세요."
                    });
                }
                //토큰 생성
                let token = await jwt.sign({
                        id: userInfoRows[0].userIdx,
                    }, // 토큰의 내용(payload)
                    secret_config.jwtsecret, // 비밀 키
                    {
                        expiresIn: '365d',
                        subject: 'userInfo',
                    } // 유효 시간은 365일
                );
    
                res.json({
                    jwt: token,
                    isSuccess: true,
                    code: 200,
                    message: "로그인 성공"
                });
            }
            else{
                const [userInfoRows] = await userDao.selectUserInfobyuserId(Id);
                console.log(userInfoRows);
                if (userInfoRows.length < 1) {
                    return res.json({
                        isSuccess: false,
                        code: 310,
                        message: "없는 아이디거나 비밀번호가 틀렸습니다."
                    });
                }
    
                const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
                if (userInfoRows[0].password !== hashedPassword) {
                    return res.json({
                        isSuccess: false,
                        code: 310,
                        message: "없는 아이디거나 비밀번호가 틀렸습니다."
                    });
                }
                if (userInfoRows[0].isDeleted === "Y") {
                    return res.json({
                        isSuccess: false,
                        code: 312,
                        message: "탈퇴 된 계정입니다. 고객센터에 문의해주세요."
                    });
                }
                //토큰 생성
                let token = await jwt.sign({
                        id: userInfoRows[0].userIdx,
                    }, // 토큰의 내용(payload)
                    secret_config.jwtsecret, // 비밀 키
                    {
                        expiresIn: '365d',
                        subject: 'userInfo',
                    } // 유효 시간은 365일
                );
    
                res.json({
                    jwt: token,
                    isSuccess: true,
                    code: 200,
                    message: "로그인 성공"
                });
            }            
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
};


/**
 update : 2019.09.23
 03.check API = token 검증
 **/
exports.check = async function (req, res) {
    res.json({
        isSuccess: true,
        code: 200,
        message: "검증 성공",
        info: req.verifiedToken
    })
};


