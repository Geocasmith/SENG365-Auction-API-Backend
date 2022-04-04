import {Request} from "express";
import {getPool} from "../../config/db";
import Logger from "../../config/logger";

const getPaginated = async (req:Request):Promise<any> => {

    // Query where you get the maximum bid for each auction_id in auction_bid and create a new column with the user_ids of all the bidders in a list. This is joined with the auction table
    const initialQuery = `
        SELECT auction_id as auctionId, title, reserve, seller_id as sellerId, category_id as categoryId,
        first_name as sellerFirstName, last_name as sellerLastName, end_date as endDate,numBids,highestBid,bidders
         FROM (SELECT
            auction_id,
            MAX(amount) AS highestBid,COUNT(amount) as numBids,
            GROUP_CONCAT(DISTINCT user_id) AS bidders
        FROM auction_bid
        GROUP BY auction_id)as bidder JOIN auction ON auction.id=bidder.auction_id JOIN user ON seller_id=user.id `
    // Query to only show auction_ids that have a certain bidder

    // Creates an empty list of strings called whereQuery and appends clauses to it if they exist
    const whereQuery = []
    // If search provided
    if(req.query.search){
        // Add search to whereQuery
        whereQuery.push(`like '%${req.query.search}%' or description like '%${req.query.search}%'`)
    }
    // If categoryIds provided
    if(req.query.categoryIds) {
        // Gets all categories in categoryIds and writes them in a string to put in an IN statement
        let categories = ''
        // if req.query.categoryIds is a number
        if (typeof req.query.categoryIds === 'string') {
            // Add categoryIds to categories
            categories = req.query.categoryIds
        }
        whereQuery.push(`category_id in (${categories})`)

    }
    // If sellerId provided
    if(req.query.sellerId){
        whereQuery.push(`seller_id = ${req.query.sellerId}`)
    }
    // wont add a where statement if whereQuery is empty
    const whereQueryString = whereQuery.length>0 ?' where '+ whereQuery.join(' and '):''
    // Sort by string
    // const sortQuery = ' order by `auction`.`end_date` desc'
    /**
     * Does the sorting
     */
    // @ts-ignore
    const sortBy : string = req.query.sortBy;
    let sortQuery;
    switch (sortBy){
        case undefined:
            sortQuery = ' order by `end_date` desc'
            break;
        case 'ALPHABETICAL_ASC':
            sortQuery = ' order by `title` asc'
            break
        case 'ALPHABETICAL_DESC':
            sortQuery = ' order by `title` desc'
            break
        case 'BIDS_ASC':
            sortQuery = ' order by `max_bid` asc'
            break
        case 'BIDS_DESC':
            sortQuery = ' order by `max_bid` desc'
            break
        case 'RESERVE_ASC':
            sortQuery = ' order by `reserve` asc'
            break
        case 'RESERVE_DESC':
            sortQuery = ' order by `reserve` desc'
            break
        default:
            sortQuery = ' order by `end_date` desc'
    }

    // SQL statement to only get the rows with the highest bid for each auction
    const highestBidQuery = `select auction_id, max(amount) as highest_bid from auction_bid group by auction_id`
    // const highestBidQuery = `select auction_id, max(amount) as amount from auction_bid group by auction_id`
    Logger.info(initialQuery + whereQueryString+sortQuery)
    const conn = await getPool().getConnection();
    const [rows] = await conn.query(initialQuery + whereQueryString+sortQuery)
    conn.release();

    return rows;

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
const createAuction = async(title: string, description: string, categoryID: number, endDate: string, reserve:number, sellerID:number): Promise<any> => {
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
export{insert,getCategory,createAuction,remove,getOne,getSellerfromAuctionID,getCategories,getAllBids,createBid,update,getPaginated}