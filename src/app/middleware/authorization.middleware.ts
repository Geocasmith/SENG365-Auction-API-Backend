// Checks if xAuth is not undefinied and if it exists in the db
import {NextFunction, Request, Response} from "express";
import * as passwords from "../models/passwords.model";

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
    if(req.userID !== parseInt(req.params.id,10)){
        res.status(403).send("Forbidden");
    }
    else{
        next();
    }
}
export{isAuthorized,hasPermissions}