import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as users from '../models/users.model';

const register = async (req: Request, res: Response) => {
    Logger.http('Registering user');
    try {
        if(!req.body.hasOwnProperty('firstName') || !req.body.hasOwnProperty('lastName') ||
            !req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('email')) {
            Logger.http('Missing information required to register user');
            res.status(400).send('Missing information required to register user');
        } else {
            const result = await users.insert(req.body.firstName, req.body.lastName, req.body.email, req.body.password);
            Logger.http('User created');
            res.status( 201 ).send({"user_id": result.insertId} );
        }


    }catch (err){
        Logger.error(err);
        res.status(500).send(err);
    }
};

const login = async (req: Request, res: Response) => {
    Logger.http('Logging in user');
    const x = req.headers;
    try {
        if(!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')) {
            Logger.http('Email or password not provided');
            res.status(400).send('Bad request');
        } else {
            const auth = req.headers["X-Authorization"]
            Logger.http(req.headers);
            const result = await users.login(req.body.email, req.body.password,auth[0]);

        }
    }catch (err){
        Logger.error(err);
        res.status(500).send(err);
    }
};

export {register,login}