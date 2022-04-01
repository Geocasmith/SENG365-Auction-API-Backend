import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as auth from '../controllers/authorization.controller'
import * as users from '../models/users.model';
import * as passwords from "../models/passwords.model"
import * as auctions from '../models/autions.model';

const viewPaginated = async (req: Request, res: Response): Promise<void> =>{
    res.status(200).send("hi");
}
// 400 if title, description, endDate or categoryID is missing from the body. 400 if endDate is in the past.
// 401 if the user is not logged in.
const create = async (req: Request, res: Response): Promise<void> => {
    // 400 if title, description, endDate or categoryID is missing from the body. 400 if endDate is in the past.
    // 401 if the user is not logged in.
    // if (!await auth.isAuthorized(req, res)) {
    //     Logger.info("NOT AUTHENTICATED");
    //     return;
    // }
    try {
        // if title, description, endDate or categoryID is missing from the body
        if (!req.body.hasOwnProperty("title") || !req.body.hasOwnProperty("description") || !req.body.hasOwnProperty("endDate") || !req.body.hasOwnProperty("categoryID")) {
            res.status(400).send("400 Bad Request, missing body");
        } else {
            // if the endDate is in the past
            if (req.body.endDate < new Date()) {
                res.status(400).send("400 Bad Request, endDate is in the past");
            } else {
                // if categoryID does not reference a category
                const result = await auctions.getCategory(parseInt(req.body.categoryID, 10))
                if (result.length === 0) {
                    res.status(400).send("400 Bad Request, categoryID does not reference a category");

                }
            }
        }
    }catch(err){
        res.status(500).send('Error')
    }
}


export {create,viewPaginated}