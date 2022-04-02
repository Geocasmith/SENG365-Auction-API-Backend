import {Request, Response} from "express";
import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import * as passwords from "../models/passwords.model"

const getPaginated = async (req:Request) => {
    // Initialises query, joins on auction id
    const query = 'SELECT * FROM `auction` JOIN `auction_bid` on `auction`.`id`=`auction_bid`.`auction_id`'
    // Creates an empty list of strings called whereQuery and appends clauses to it if they exist
    const whereQuery = []
    // If search provided
    if(req.params.search){
        // Add search to whereQuery
        whereQuery.push(`like '%${req.params.search}%' or description like '%${req.params.search}%'`)
    }
    // If categoryIds provided
    if(req.params.categoryIds){
        // Gets all categories in categoryIds and writes them in a string to put in an IN statement
        let categories = ''
        for(let i = 0; i<req.params.categoryIds.length; i++){
            categories = categories + `${req.params.categoryIds[i]}`
            if(i!==req.params.categoryIds.length-1){
                categories = categories + ','
            }
        }
        whereQuery.push(`category_id in (${categories})`)
    }
    // If sellerId provided
    if(req.params.sellerId){
        whereQuery.push(`seller_id = ${req.params.sellerId}`)
    }
    // If bidderId provided
    if(req.params.bidderId){
        whereQuery.push(`where user_id = ${req.params.bidderId}`)
    }

    // Creates the wherequery string
    const whereQueryString = ' where '+ whereQuery.join(' and ')
    Logger.info(query + whereQueryString)

    const conn = await getPool().getConnection();

};
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
export{insert,getCategory,create,remove,getOne,getSellerfromAuctionID,getCategories,getAllBids,createBid,update,getPaginated}