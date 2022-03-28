import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as users from '../models/users.model';
import randtoken from 'rand-token';

// TODO check if user exists
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
    try {
        if(!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')) {
            Logger.http('Email or password not provided');
            res.status(400).send('Bad request');
        } else {
            Logger.http(req.headers);
            const result = await users.login(req.body.email, req.body.password,randtoken.generate(16));
            if (result==null){
                res.status(400).send('Incorrect login details, user not found');
            }else{
                res.status(200).send({"userId": result.id,"token": result.auth_token});
            }
        }
    }catch (err){
        Logger.error(err);
        res.status(500).send(err);
    }
};
const viewUser = async (req: Request, res: Response) => {
    Logger.http(`GET user id: ${req.params.id}`)
    try {
        const xAuth = req.header("X-Authorization")
        const id = req.params.id;
        const result = await users.getOne(parseInt(id,10));
        if( result.length === 0 ){
            res.status(404).send('User not found'); // sends 404 back
        }else{
            res.status(200).send(result[0]); // sends result back
        }
    }catch (err){
        Logger.error(err);
        res.status(500).send(err);
    }
};
const logout = async (req:Request, res: Response): Promise<void> => {
    Logger.http('Logging out user');
    try {
        const xAuth = req.header("X-Authorization")
        // check if xAuth is undefined
        if(xAuth === undefined){
            Logger.http('X-Authorization header not provided');
            res.status(401).send('Bad request');
        } else {
            const result = await users.logout(req.header("X-Authorization"));

            if (result.affectedRows === 0) {
                Logger.http('No matching auth token in db')
                res.status(401).send('Unauthorized')
            }
            res.status(200).send('OK');
        }
    }catch (err){
        Logger.error(err);
        res.status(501).send(err);
    }
};



export {register,login,logout,viewUser}