import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import * as passwords from "../models/passwords.model"
import {ResultSetHeader} from "mysql2";
import {compare} from "bcrypt";

const getOne = async (id: number): Promise<any> => {
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

const login = async (email: string, password: string, xauthorization:string): Promise<any> => {
    Logger.info(`Logging in and checking if user in database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ?';
    const [rows] = await conn.query(query, [email]);
    conn.release();
    if (rows.length === 0) {// if no user found
        return null;
    }
    if(compare(password, rows[0].password)){// if user found and password matches
        // sets the auth_token
        const updateQuery = 'update user set auth_token = ? where id = ?';
        const [updateRows] = await conn.query(updateQuery, [xauthorization, rows[0].id]);
        return updateRows;
    }

//    bcryot compare
//    checkauth in request headers in passowrd modl
    // select star where auth
    // check id in return

};



export {getOne, insert, login}