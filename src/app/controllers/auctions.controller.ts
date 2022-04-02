import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as auth from '../controllers/authorization.controller'
import * as users from '../models/users.model';
import * as passwords from "../models/passwords.model"
import * as auctions from '../models/autions.model';
import * as util from "../util/utilities.util";


const viewPaginated = async (req: Request, res: Response): Promise<void> =>{
    res.status(200).send("hi");
}
// 400 if title, description, endDate or categoryID is missing from the body. 400 if endDate is in the past.
// 401 if the user is not logged in.
const create = async (req: Request, res: Response): Promise<void> => {
    // 400 if title, description, endDate or categoryID is missing from the body. 400 if endDate is in the past.
    // 401 if the user is not logged in.
    try {
        // if title, description, endDate or categoryID is missing from the body
        if(await util.bodyHasRequiredProperties(req, res, ['title', 'description', 'endDate', 'categoryID'])){
            // if the endDate is in the past
            if (req.body.endDate < new Date()) {
                res.status(400).send("400 Bad Request, endDate is in the past");
            } else {
                // Get categories matching ID and check if exists
                const result = await auctions.getCategory(parseInt(req.body.categoryID, 10))
                if (result.length === 0) {
                    res.status(400).send("400 Bad Request, categoryID does not reference a category");
                }else{
                    // Set reserve to 0 if no exists
                    let reserve = req.body.reserve;
                    if (reserve === undefined) {
                        reserve = 1;
                    }
                    // Create a new auction
                    const auction = await auctions.create(req.body.title, req.body.description, parseInt(req.body.categoryID, 10), req.body.endDate, reserve,req.userID);
                    res.status(201).send({"auctionId":parseInt(auction.insertId, 10)});
                }
            }
        }
    }catch(err){
        res.status(500).send('Error')
    }
}
// Updates an auction
const update = async (req: Request, res: Response): Promise<void> => {
    Logger.info('Updating auction db');


}


const getAuction = async (req: Request, res: Response): Promise<void> => {
    // Checks if there is an id in the parameters and if its a number
    if(req.params.id === undefined || !isNaN(parseInt(req.params.id, 10))) {
        res.status(400).send("400 Bad Request, id is missing from the parameters");
    }
    // Gets the auction matching the id, returns 404 if not found
    const auction = await auctions.getOne(parseInt(req.params.id, 10));
    // If auction not found return 404 or return details of the auction
    if (auction.length === 0) {
        res.status(404).send("Auction Not Found");
    } else {
        // Get user from the auction id
        const seller = await users.getOne(auction[0].seller_id);
        res.status(200).send({
            "auctionId": auction[0].id,
            "title": auction[0].title,
            "categoryId": auction[0].category_id,
            "sellerId": auction[0].seller_id,
            "sellerFirstName": seller[0].first_name,
            "sellerLastName": seller[0].last_name,
            "reserve": auction[0].reserve,
            // TODO INCORPORATE BIDS
            "numBids": 37,
            "highestBid": 100,
            "endDate": auction[0].end_date,
            "description": auction[0].description})
        }
}

export {create,viewPaginated,getAuction,update}