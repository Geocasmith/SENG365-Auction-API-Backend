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
const create = async(title: string, description: string, categoryID: number, endDate: string,reserve:number,sellerID:number): Promise<any> => {
    Logger.info(`Creating auction in db`);
    const conn = await getPool().getConnection();
    const query = 'insert into auction (title, description, category_id, end_date, reserve,seller_id) values (?,?,?,?,?,?)';
    const [ rows ] = await conn.query( query, [ title, description, categoryID, endDate, reserve , sellerID] );
    conn.release();
    return rows;
}
const getOne = async(id: number): Promise<Auction[]> => {
    Logger.info('Get one auction from the db');
    const conn = await getPool().getConnection();
    const query = 'select * from auction where id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
}
const getSellerfromAuctionID = async (id: number): Promise<any> => {
    Logger.info('Get seller id from auction id');
    const conn = await getPool().getConnection();
    const query = 'select * from auction where id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
}
export{insert,getCategory,create,getOne,getSellerfromAuctionID}