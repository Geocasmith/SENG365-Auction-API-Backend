// Checks if xAuth is not undefinied and if it exists in the db
import {NextFunction, Request, Response} from "express";
import * as passwords from "../models/passwords.model";

const isAuthorized = async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
    const xAuth = req.header("X-Authorization");
    const request = req.headers;
    if(xAuth === undefined || !await passwords.tokenExists(xAuth)){
        res.status(401).send("Unauthorized");
    }
    else{
        next();
    }
}
export{isAuthorized}