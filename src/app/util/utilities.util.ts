import {Request, Response} from "express";
import * as auctions from '../models/autions.model';
import * as users from '../models/users.model';
import * as images from "../models/images.model";

// Goes through the request body and checks if all of the required fields are present. Required fields are given in the parameter.
const bodyHasRequiredProperties = async (req:Request, res:Response, properties: string[]): Promise<boolean> => {
    for (const item of properties) {
        if (!req.body.hasOwnProperty(item)) {
            res.status(400).send("400 Bad Request, missing body item " + item);
            return false;
        }
    }
    return true;
};
const auctionExists = async (req: Request, res: Response): Promise<boolean> => {
    // Checks if there is an id in the parameters and if its a number
    if(req.params.id === undefined || isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("4001 Bad Request, id is missing from the parameters");
        return false;
    }else{
        // Gets the auction matching the id, returns 404 if not found
        const auction = await auctions.getOne(parseInt(req.params.id, 10));
        // If auction not found return 404 or return details of the auction
        if (auction.length === 0) {
            res.status(404).send("Auction Not Found");
            return false;
        }
    }
    return true;
};
const userExists = async (req: Request, res: Response): Promise<boolean> => {
    // Checks if there is an id in the parameters and if its a number
    if(req.params.id === undefined || isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("4001 Bad Request, id is missing from the parameters");
        return false;
    }else{
        // Gets the auction matching the id, returns 404 if not found
        const user = await users.getOne(parseInt(req.params.id, 10));
        // If auction not found return 404 or return details of the auction
        if (user.length === 0) {
            res.status(404).send("User Not Found");
            return false;
        }
    }
    return true;
};

// Checks if the date in params is not in the past
const dateInTheFuture = async (req: Request, res: Response): Promise<boolean> => {
    if (new Date(req.body.endDate) < new Date()) {
        res.status(400).send("400 Bad Request, endDate is in the past");
        return false;
    }
    return true;
};
// Checks if the auction has any bids
const hasNoBids = async (req: Request, res: Response): Promise<boolean> => {
    const bids = await auctions.getAllBids(parseInt(req.params.auctionId, 10));
    if(bids.length>0){
        res.status(403).send("Forbidden, auction has bids");
        return false;
    }
    return true;
};
// Checks if the category ID in the parameters exists
const categoryExists = async (req: Request, res: Response): Promise<boolean> => {
    const result = await auctions.getCategory(parseInt(req.body.categoryId, 10))
    if (result.length === 0) {
        res.status(404).send("404 Bad Request, categoryID does not reference a category");
        return false;
    }
    return true;
};
const auctionHasImage = async (req: Request, res: Response): Promise<boolean> => {
    const result = await images.getImage('auction',parseInt(req.params.id, 10));
    if (result.length === 0) { // No auction found
        res.status(404).send('Not found');
        return false;
    } else {
        // If image null in db then return 404
        if (result[0].image_filename === null) {
            res.status(404).send('Auction image is null');
            return false;
        }
        return true;
    }
};
const userHasImage = async (req: Request, res: Response): Promise<boolean> => {
    const result = await images.getImage('user',parseInt(req.params.id, 10));
    if (result.length === 0) { // No user found
        res.status(404).send('Not found');
        return false;
    } else {
        // If image null in db then return 404
        if (result[0].image_filename === null) {
            res.status(404).send('User image is null');
            return false;
        }
        return true;
    }
};
const isValidImageExtension = async (res:Response,extension:string): Promise<boolean> => {
    if(extension !== 'jpg' && extension !== 'jpeg' && extension !== 'png' && extension !== 'gif'){
        res.status(400).send('400 Bad Request, invalid image extension');
        return false;
    }
    return true;
};
const validType = async(input:any,type:string,res:Response): Promise<boolean> => {
    if(typeof input !== type){
        res.status(400).send('400 Bad Request, invalid type');
        return false;
    }
    return true;
};

export{bodyHasRequiredProperties,auctionExists,dateInTheFuture,hasNoBids,categoryExists,userExists,userHasImage,auctionHasImage,isValidImageExtension,validType}