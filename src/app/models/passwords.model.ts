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
// checks if authtokens match and if user ids match
const checkAuth = async(userID:string,xAuthorization:string):Promise<any>=>{
    Logger.info("Checking Auth, if authtokens match and if ids match");
    const conn = await getPool().getConnection();
    const query = 'select * from users where id = ? and authToken = ?';
    const [rows] = await conn.query(query,[userID,xAuthorization]);
    conn.release()
    return rows
};

const authExists = async(xAuthorization:string):Promise<any>=>{
    Logger.info("Checking if authtoken exists");
    const conn = await getPool().getConnection();
    const query = 'select * from users where authToken = ?';
    const [rows] = await conn.query(query,[xAuthorization]);
    conn.release()
    return rows
};

export {hash};