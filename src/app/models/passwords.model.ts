import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import bcrypt from "bcrypt";

const hash = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
};
const compare = async (password: string, hashedPassword: string): Promise<boolean> => {
    const isCorrectPassword = await bcrypt.compare(password, hashedPassword);
    return isCorrectPassword;
};

// checks for rows where authtokens match and if user ids match
const checkAuth = async(userID:string,xAuthorization:string):Promise<string>=>{
    Logger.info("Checking Auth, if authtokens match and if ids match");
    const conn = await getPool().getConnection();
    const query = 'select * from users where id = ? and authToken = ?';
    const [rows] = await conn.query(query,[userID,xAuthorization]);
    conn.release()
    return rows
};
const createAuth = async(email: string, token: string): Promise<any> => {
    Logger.info("Creating authtoken");
    const conn = await getPool().getConnection();
    const updateQuery = 'update user set auth_token = ? where email = ?';
    const [rows] = await conn.query(updateQuery,[token,email]);
    return rows
};

// returns rows where authtoken matches, none if no match
const getUserFromToken = async(xAuthorization:string):Promise<User[]>=>{
    Logger.info("Checking if authtoken exists");
    const conn = await getPool().getConnection();
    const query = 'select * from user where auth_token = ?';
    const [rows] = await conn.query(query,[xAuthorization]);
    conn.release()
    return rows
};
const getUserIDFromToken = async(xAuthorization:string):Promise<number>=>{
    Logger.info("Getting user ID from token");
    const conn = await getPool().getConnection();
    const query = 'select id from user where auth_token = ?';
    const [rows] = await conn.query(query,[xAuthorization]);
    conn.release()
    return parseInt(rows[0].id,10)
};
const tokenExists = async (xAuthorization: string): Promise<boolean> => {
    Logger.info("Checking if authtoken exists");
    const conn = await getPool().getConnection();
    const query = 'select * from user where auth_token = ?';
    const [rows] = await conn.query(query,[xAuthorization]);
    conn.release()
    return rows.length > 0
};
const passwordMatchesToken = async (xAuthorization: string, password: string): Promise<boolean> =>{
    const conn = await getPool().getConnection();
    const query = 'select * from user where auth_token = ?';
    const [rows] = await conn.query(query,[xAuthorization]);
    if(await bcrypt.compare(password, rows[0].password)) {
        return true
    }
    return false
};

export {hash,compare,checkAuth,getUserFromToken,createAuth,tokenExists,passwordMatchesToken,getUserIDFromToken};