import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import * as passwords from "../models/passwords.model"
import bcrypt from "bcrypt";

const getOne = async (id: number): Promise<User[]> => {
    Logger.info(`Getting one user from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ?';
    const [rows] = await conn.query(query, [id]);
    conn.release();
    return rows;
};

const insert = async (firstName: string, lastName: string, email: string, password: string): Promise<any> => {
    Logger.info(`Inserting a new user into the database`);
    const conn = await getPool().getConnection();
    const query = 'insert into user (first_name, last_name, email, password) values (?, ?, ?, ?)';
    const hashedPassword = await passwords.hash(password);
    const [rows] = await conn.query(query, [firstName, lastName, email, hashedPassword]);
    conn.release();
    return rows;
};

const login = async (email: string, password: string, token:string): Promise<User[]> => {
    Logger.info(`Logging in and checking if user in database`);
    // Gets user info from db
    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ?';
    const [rows] = await conn.query(query, [email]);
    conn.release();

    // if no user found
    if (rows.length === 0) {
        return null;
    }
    // if user found and password matches
    if(await bcrypt.compare(password, rows[0].password)) {
        Logger.info(`Passwords match`);
        await passwords.createAuth(email,token); // sets the auth_token
        const user = await passwords.getUserFromToken(token);
        return user;
    }
    // if password doesn't match
    return null;
};
// gets user from db who has the token and sets the token to null
const logout = async (token:string): Promise<any> => {
    Logger.info(`Logging out user`);
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = null where auth_token = ?';
    const [rows] = await conn.query(query, [token]);
    conn.release();
    return rows;
};

const alter = async(id:number, firstName:string, lastName:string, email:string, password:string): Promise<any> => {
    Logger.info(`Updating user in database`);
    const conn = await getPool().getConnection();
    const query = 'update user set first_name = ?, last_name = ?, email = ?, password = ? where id = ?';
    const [rows] = await conn.query(query, [firstName, lastName, email, password, id]);
    conn.release();
    return rows;
};
const emailExists = async (email: string): Promise<boolean> => {
    Logger.info(`Checking if email exists in database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ?';
    const [rows] = await conn.query(query, [email]);
    conn.release();
    return rows.length > 0;
};
const setUserImage = async (id: number, imageName: string): Promise<any> => {
    Logger.info(`Setting user image name`);
    const conn = await getPool().getConnection();
    const query = 'update user set image_filename = ? where id = ?';
    const [rows] = await conn.query(query, [imageName, id]);
    conn.release();
    return rows;
};

export {getOne, insert, login, logout,emailExists,alter,setUserImage}