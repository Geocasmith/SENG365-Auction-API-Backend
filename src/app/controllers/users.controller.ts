import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as users from '../models/users.model';
import * as images from '../models/images.model';
import * as passwords from "../models/passwords.model"
import randtoken from 'rand-token';
import fs from 'mz/fs';
const imageDirectory = './storage/images/';


const mimeTypes = {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif"
};
import {getUserFromToken} from "../models/passwords.model";
import * as util from "../util/utilities.util";
import mime from "mime";

// TODO check if user exists
const register = async (req: Request, res: Response) => {
    Logger.http('Registering user');
    try {
        if(await util.bodyHasRequiredProperties(req, res, ['firstName', 'lastName', 'password', 'email'])){
            const result = await users.insert(req.body.firstName, req.body.lastName, req.body.email, req.body.password);
            Logger.http('User created');
            res.status( 201 ).send({"userId": parseInt(result.insertId,10)} );
        }
    }catch (err){
        Logger.error(err);
        res.status(500).send(err);
    }
};

const login = async (req: Request, res: Response) => {
    Logger.http('Logging in user');
    try {
        if(await util.bodyHasRequiredProperties(req, res,['email','password'])){
            Logger.http(req.headers);
            const result = await users.login(req.body.email, req.body.password, randtoken.generate(16));
            if (result == null) {
                res.status(400).send('Incorrect login details, user not found');
            } else {
                res.status(200).send({"userId": result[0].id, "token": result[0].auth_token});
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
        // Gets the user in the params
        const id = req.params.id;
        const result = await users.getOne(parseInt(id,10));
        if( result.length === 0 ){
            res.status(404).send('User not found'); // sends 404 back
        }else{
            if(req.userID === result[0].id) {// result is own user so add email too
                Logger.http('User found is current user');
                res.status(200).send({"firstName":result[0].first_name,"lastName":result[0].last_name,"email":result[0].email});
            }else{
                Logger.http('User found someone else');
                res.status(200).send({"firstName":result[0].first_name,"lastName":result[0].last_name});
            }
        }
    }catch (err){
        Logger.error(err);
        res.status(500).send(err);
    }
};

const editUser = async(req: Request, res: Response) => {
    Logger.http(`Patch user id: ${req.params.id}`)
    try {
        // Checks if user is logged in (token is valid)
        const xAuth = req.header("X-Authorization")
        const body = req.body;
        // check if email valid and passwords match
        if(!(req.body.email.includes("@")) || ! await passwords.passwordMatchesToken(req.body.currentPassword, xAuth) || await users.emailExists(req.body.email)){
            res.status(400).send('Bad request');
            return;
        }
        const updateResult = await users.alter(req.userID+'',req.body.firstName,req.body.lastName,req.body.email,req.body.password,req.body.currentPassword);
        if( updateResult.length === 0 ){
            res.status(404).send('User not found'); // sends 404 back
        }else {
            res.status(200).send('OK')
        }
    }catch (err){
        Logger.error(err);
        res.status(500).send(err);
    }
};
const logout = async (req:Request, res: Response): Promise<void> => {
    Logger.http('Logging out user');
    try {
        const result = await users.logout(req.header("X-Authorization"));
        res.status(200).send('OK');

    }catch (err){
        Logger.error(err);
        res.status(501).send(err);
    }
};

/**
 * USER IMAGES
 */
const getImage = async (req:Request, res: Response): Promise<void> => {
    try {
        if(await util.userExists(req, res)){
            // Gets image path from userID
            if(util.userHasImage(req,res)){
                // Gets the image path from db
                const result = await images.getUserImages(parseInt(req.params.id,10));
                const path = imageDirectory+result[0].image_filename;

                    // Checks if image exists
                    if(fs.existsSync(path)) {

                        // Gets the image from the path and sends it in the response
                        const image = await fs.readFile(path);
                        // Gets the content type from the image path
                        const extension = result[0].image_filename.split('.').pop()
                        // Writes the image to the response
                        // @ts-ignore
                        await res.writeHead(200, {'Content-Type': mimeTypes[extension] });
                        res.write(image);
                        res.end();

                    }else{
                        res.status(404).send('User image not found');
                    }
            }
        }

    }catch (err){
        Logger.error(err);
        res.status(501).send(err);
    }
}
const uploadImage = async (req:Request, res: Response): Promise<void> => {
    // TODO check if no image of same name exists
    Logger.info('Uploading image');
    // let sendCode = 200;
    const body = req.body;
    // Exists then delete image and set code
    // if(util.userHasImage(req,res)){
    //     await deleteImage(req,res);
    //     sendCode = 201;
    // }
    if(Buffer.isBuffer(req.body)){
        Logger.info('Image in the buffer');


    }
    try{
        // Gets the image from the body
        const image = req.body.image;
    }catch (err){
        Logger.error(err);
        res.status(501).send(err);
    }
}

const deleteImage = async (req:Request, res: Response): Promise<void> => {
    // Checks if has image otherwise 404
    if (util.userHasImage(req, res)) {
        const result = await images.deleteImage(req.userID)
        if (result.affectedRows === 0) {
            res.status(404).send('User image not found');
        } else {
            res.status(200).send('OK');
        }
    }
}

export {register,login,logout,viewUser,editUser,getImage,uploadImage,deleteImage}