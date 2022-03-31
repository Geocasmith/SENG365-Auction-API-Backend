import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as passwords from "../models/passwords.model"

// Checks if xAuth is not undefinied and if it exists in the db
const isAuthorized = async (req: Request, res: Response): Promise<boolean> =>{
    const xAuth = req.header("X-Authorization")
    if(xAuth === undefined || !await passwords.tokenExists(xAuth)){
        res.status(401).send("Unauthorized");
        return false;
    }
    return true
}

export{isAuthorized}