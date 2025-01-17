import {Request, Response} from "express";

export default (req:Request, res:Response, next: () => void) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    next();
};
// Make methods in here which will be used in the routes
// Checks the body of the request has the properties in the list in the paramerters (used to check if body is complete)
