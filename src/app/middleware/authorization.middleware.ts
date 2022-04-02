// Checks if xAuth is not undefinied and if it exists in the db
import {NextFunction, Request, Response} from "express";
import * as passwords from "../models/passwords.model";
import * as auctions from '../models/autions.model';


// Checks if auth token exists
const isAuthorized = async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
    const xAuth = req.header("X-Authorization");
    if(xAuth === undefined || !await passwords.tokenExists(xAuth)){
        res.status(401).send("Unauthorized");
    }
    else{
        req.userID = await passwords.getUserIDFromToken(xAuth);
        next();
    }
}
// Checks if auth token matches the id provided in the parameters
const hasPermissions = async(req: Request, res: Response, next: NextFunction): Promise<void> =>{
    // If param is userID check if it matches the userID in the request
    if(req.userID !== parseInt(req.params.id,10)){
        res.status(403).send("Forbidden");
    }
    else{
        next();
    }
}
const isAuctionOwner = async(req: Request, res: Response, next: NextFunction): Promise<void> =>{
    const seller = await auctions.getSellerfromAuctionID(parseInt(req.params.id,10));
    if(seller.length === 0){
        res.status(404).send("Not found");
    }
    else if(seller[0].seller_id !== req.userID){
        res.status(403).send("Forbidden");
    }
    else{
        next();
    }
}
export{isAuthorized,hasPermissions,isAuctionOwner}