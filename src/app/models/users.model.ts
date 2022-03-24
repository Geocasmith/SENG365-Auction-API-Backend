import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";

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
    const query = 'insert into user (name, email, password) values (?, ?, ?)';
    const [rows] = await conn.query(query, [firstName, lastName, email, password]);
    conn.release();
    return rows;
};