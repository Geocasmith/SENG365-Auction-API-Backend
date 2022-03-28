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
const getUserFromToken = async(xAuthorization:string):Promise<string>=>{
    Logger.info("Checking if authtoken exists");
    const conn = await getPool().getConnection();
    const query = 'select * from user where auth_token = ?';
    const [rows] = await conn.query(query,[xAuthorization]);
    conn.release()
    return rows[0]
};

export {hash,compare,checkAuth,getUserFromToken,createAuth};