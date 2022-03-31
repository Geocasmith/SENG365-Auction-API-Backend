import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import * as passwords from "../models/passwords.model"

const insert = async (username: string) : Promise<any> => {
    Logger.info(`Adding user ${username} to the database`);
}
const getCategory = async(id: number): Promise<any> => {
    Logger.info(`Getting category ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from category where id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
}

export{insert,getCategory}