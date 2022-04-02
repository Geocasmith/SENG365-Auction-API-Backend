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

const remove = async(id: number): Promise<any> => {
    Logger.info(`Deleting auction in db`);
    const conn = await getPool().getConnection();
    const query = 'delete from auction where id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
}
const update = async(id: number, title: string, description: string, categoryID: number, endDate: string,reserve:number): Promise<any> => {
    Logger.info(`Updating auction ${id} in db`);
    const conn = await getPool().getConnection();
    const query = 'update auction set title = ?, description = ?, category_id = ?, end_date = ?, reserve = ? where id = ?';
    const [ rows ] = await conn.query( query, [ title, description, categoryID, endDate, reserve, id ] );
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
const getCategories = async(): Promise<Category[]> => {
    Logger.info('Get all categories from the db');
    const conn = await getPool().getConnection();
    // Get categories ordered by ID
    const query = 'select * from category order by id';
    const [ rows ] = await conn.query( query );
    conn.release();
    return rows;
}
const getAllBids = async (id: number): Promise<Bid[]> => {
    Logger.info('Get all bids from auction id');
    const conn = await getPool().getConnection();
    // get bids from auction id sorted by amount
    const query = 'select * from auction_bid where auction_id = ? order by amount desc';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
}
const createBid = async(auctionId:number, userId:number, amount:number): Promise<any> => {
    Logger.info('Creating new bid');
    const conn = await getPool().getConnection();
    const query = 'insert into auction_bid (auction_id, user_id, amount) values (?,?,?)';
    const [ rows ] = await conn.query( query, [ auctionId, userId, amount ] );
    conn.release();
    return rows;

}
export{insert,getCategory,create,remove,getOne,getSellerfromAuctionID,getCategories,getAllBids,createBid,update}