import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as auth from '../controllers/authorization.controller'
import * as users from '../models/users.model';
import * as passwords from "../models/passwords.model"
import * as auctions from '../models/autions.model';
import * as util from "../util/utilities.util";
import {auctionExists, categoryExists} from "../util/utilities.util";
import {getPaginated} from "../models/autions.model";
import fs from "mz/fs";
import * as images from "../models/images.model";
const imageDirectory = './storage/images/';

const mimeTypes = {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif"
};
const reverseMimeTypes = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/gif": "gif"
};

const viewPaginated = async (req: Request, res: Response): Promise<void> =>{
    // TODO PARAMS UNDEFINED BECAUSE ROUTE NOT DONE PROPERLY WITH PARAMS
    const search = req.query.q;
    const result = await auctions.getPaginated(req);
    // Converts the comma separated string in bidders into an array
    // tslint:disable-next-line:forin
    for(const row in result.rows){
        result.rows[row].bidders = result.rows[row].bidders.split(',');
    }
    // If bidderID in body, filter to rows with bidderID in bidders
    if(req.body.bidderID){
        result.rows = result.rows.filter((row: { bidders: string | any[]; }) => row.bidders.includes(req.body.bidderID));
    }
    // Create new object of type auctions
    // const auction = result.rows.map((row: { id: number; title: string; description: string; category: string; image: string; bidders: string | any[]; }) => {
    //     return {
    //         id: row.id,
    //         title: row.title,
    //         description: row.description,
    //         category: row.category,
    //         image: row.image,
    //     }
    // });

   // Sends the result back with 200 code
    res.status(200).send(result);
}
// 400 if title, description, endDate or categoryID is missing from the body. 400 if endDate is in the past.
// 401 if the user is not logged in.
const create = async (req: Request, res: Response): Promise<void> => {
    // 400 if title, description, endDate or categoryID is missing from the body. 400 if endDate is in the past.
    // 401 if the user is not logged in.
    try {
        // if title, description, endDate or categoryID is missing from the body
        if(await util.bodyHasRequiredProperties(req, res, ['title', 'description', 'endDate', 'categoryId'])){
            // if the endDate is in the past and in ISO8601 format
            // TODO CHECK IF IN ISO
            if (new Date(req.body.endDate) < new Date() ) {
                res.status(400).send("400 Bad Request, endDate is in the past");
            } else {
                // Get categories matching ID and check if exists
                const result = await auctions.getCategory(parseInt(req.body.categoryId, 10))
                if (result.length === 0) {
                    res.status(400).send("400 Bad Request, categoryID does not reference a category");
                }else{
                    // Set reserve to 1 if no exists
                    const reserve = req.body.reserve===undefined ? 1 : req.body.reserve;
                    // Create a new auction
                    const auction = await auctions.createAuction(req.body.title, req.body.description, parseInt(req.body.categoryId, 10), req.body.endDate, reserve,req.userID);
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
    try{
        if(await util.bodyHasRequiredProperties(req, res, ['title', 'description', 'endDate', 'categoryId','reserve'])){
            // Checks if request is valid
            if(await util.dateInTheFuture(req,res) && await util.hasNoBids(req,res) && await util.categoryExists(req,res)){
                // Set the reserve
                const reserve = req.body.reserve===undefined ? 1 : req.body.reserve;
                // Update the auction
                const updated = await auctions.update(parseInt(req.params.id,10), req.body.title, req.body.description, parseInt(req.body.categoryId, 10), req.body.endDate, reserve);
                if(updated.affectedRows === 0){
                    res.status(404).send("404 Auction not found");
                }else{
                    res.status(200).send("OK");
                }
            }
        }
    }catch (err){
        res.status(500).send('Error')
    }
}
const removeAuction = async (req: Request, res: Response): Promise<void> => {
    try{
        if(await util.hasNoBids(req,res)){
            const result = await auctions.remove(parseInt(req.params.id,10));
            res.status(200).send("OK");
        }
    }catch (err){
        res.status(500).send('Error')
    }
}

const getAuction = async (req: Request, res: Response): Promise<void> => {
    try {
        // Checks if there is an id in the parameters and if its a number
        if (await util.auctionExists(req, res)) {
            const auction = await auctions.getOne(parseInt(req.params.id, 10));

            // Get user from the auction id
            const seller = await users.getOne(auction[0].seller_id);
            const bids = await auctions.getAllBids(parseInt(req.params.id, 10));
            // If no bids, set highestBid to null
            const highestBid = bids.length > 0 ? bids[0].amount : null;

            res.status(200).send({
                "auctionId": auction[0].id,
                "title": auction[0].title,
                "categoryId": auction[0].category_id,
                "sellerId": auction[0].seller_id,
                "sellerFirstName": seller[0].first_name,
                "sellerLastName": seller[0].last_name,
                "reserve": auction[0].reserve,
                // TODO INCORPORATE BIDS
                "numBids": bids.length,
                "highestBid": highestBid,
                "endDate": auction[0].end_date,
                "description": auction[0].description
            })
        }
    } catch (err) {
        res.status(500).send('Error')
    }
}

const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await auctions.getCategories();
        res.status(200).send(categories);
    } catch (err) {
        res.status(500).send('Error')
    }
}
/**
 * Images
 */
const getImage = async (req:Request, res: Response): Promise<void> => {
    try {
        if(await util.auctionExists(req, res)){
            // Gets image path from userID
            if(await util.auctionHasImage(req, res)){
                // Gets the image path from db
                const result = await images.getImage('auction',parseInt(req.params.id,10));
                const path = imageDirectory+result[0].image_filename;
                // Checks if image exists
                if(fs.existsSync(path)) {
                    // Gets the image from the path and sends it in the response
                    const data = await fs.readFileSync(path);
                    // Gets the content type from the image path
                    const extension = result[0].image_filename.split('.').pop()
                    if (await util.isValidImageExtension(res,extension)) { // @ts-ignore
                        res.setHeader('content-type', mimeTypes[extension]);
                        res.status(200).send(data);
                    }
                }else{
                    res.status(404).send('Auction image not found');
                }
            }
        }

    }catch (err){
        Logger.error(err);
        res.status(501).send(err);
    }
}
const uploadImage = async (req:Request, res: Response): Promise<void> => {
    try {
        const auctionId = parseInt(req.params.id,10);
        const body = req.body;
        const contentType = req.header("Content-Type");
        const extension = contentType.split('/').pop();

        if (await util.isValidImageExtension(res,extension)) {
            // Check that request body is not multipart/form-data
            const imageName = 'auction_' + req.params.id + '.' + extension;
            // TODO Check for empty image body
            try {
                await fs.writeFileSync(imageDirectory + imageName, body, 'binary');
            } catch (e) {
                Logger.error(e);
                res.status(400).send(e);
                return;
            }
            // Auction has image will return different code and replace the current image
            const auctionImage = await images.getImage('auction', auctionId);
            if (await images.imageExists('auction', auctionId)) {
                await images.deleteImage('auction', auctionId);
                await images.setImage('auction', auctionId, imageName);
                res.status(200).send('OK');
            } else {
                await images.setImage('auction', auctionId, imageName);
                res.status(201).send('OK');
            }
        }
    } catch (err){
        Logger.error(err);
        res.status(501).send(err);
    }
}
/**
 * BIDS
 */
const getBids = async (req: Request, res: Response): Promise<void> => {
    try{
        if(await util.auctionExists(req, res)){
            const bids = await auctions.getAllBids(parseInt(req.params.id, 10));
            res.status(200).send(bids);
        }
    } catch (err) {
        res.status(500).send('Error')
    }
}

const placeBid = async (req: Request, res: Response): Promise<void> => {
    try{
        if(await util.bodyHasRequiredProperties(req, res, ['amount']) && await util.validType( req.body.amount,'number',res)){
            if(await util.auctionExists(req, res)){
                // Checks if the user is the owner of the auction
                const auction = await auctions.getOne(parseInt(req.params.id, 10));
                // Checks if the auction is yours
                if(auction[0].seller_id === req.userID){
                    res.status(403).send('You cant bid on closed auctions');
                    return;
                }
                // checks if auction end date in the past (for closed auctions)
                if(new Date(auction[0].end_date) < new Date()){
                    res.status(403).send('Auction is closed');
                    return;
                }
                // Gets all bids for the auction
                const bids = await auctions.getAllBids(parseInt(req.params.id, 10));
                // If there are bids, get the highest bid amount
                let topBidAmount = 0;
                if(bids.length > 0){
                    topBidAmount = bids[0].amount;
                }
                const bidAmount = parseInt(req.body.amount,10);
                if(bidAmount>topBidAmount){
                    // place the bid
                    await auctions.createBid(parseInt(req.params.id, 10), req.userID, bidAmount);
                    res.status(201).send('Created');
                }else{
                    res.status(403).send('Forbidden, bid amount too low')
                }
            }
        }
    } catch (err) {
        res.status(500).send('Error')
    }

}


export {create,viewPaginated,getAuction,update,getCategories,getBids,placeBid,removeAuction,getImage,uploadImage};