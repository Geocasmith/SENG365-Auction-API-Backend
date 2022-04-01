import {Request, Response} from "express";
import Logger from "../../config/logger";

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
export{bodyHasRequiredProperties}