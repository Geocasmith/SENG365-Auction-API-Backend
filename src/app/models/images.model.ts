import {getPool} from "../../config/db";
import Logger from "../../config/logger";

const imageDirectory = './storage/images/';

const getImage = async(tableName:string,userId:number): Promise<any> => {
    // Get the user's image_filename from the database
    Logger.info('Get users image from db');
    const conn = await getPool().getConnection();
    const query = 'select image_filename from '+tableName+' where id = ?';
    const [rows] = await conn.query(query, [userId]);
    conn.release();
    return rows;
};
const hasImage = async(tableName:string,userId:number): Promise<any> => {
    // Get the user's image_filename from the database
    Logger.info('Get users image from db');
    const conn = await getPool().getConnection();
    const query = 'select image_filename from '+tableName+' where id = ?';
    const [rows] = await conn.query(query, [userId]);
    conn.release();
    // Return if rows is null in the database

};

const deleteImage = async(tableName:string,Id:number): Promise<any> => {
    Logger.info('Deleting users image from db');
    const conn = await getPool().getConnection();
    const query = 'update '+tableName+' set image_filename = null where id = ?';
    const [rows] = await conn.query(query, [Id]);
    conn.release();
    return rows;
};

const setImage = async (tableName:string,id: number, imageName: string): Promise<any> => {
    Logger.info(`Setting user image name`);
    const conn = await getPool().getConnection();
    const query = 'update '+tableName+' set image_filename = ? where id = ?';
    const [rows] = await conn.query(query, [imageName, id]);
    conn.release();
    return rows;
};
// False if image_filename in db is null
const imageExists = async (tableName:string,id: number): Promise<any> => {
    Logger.info(`Checking if user image is null`);
    const conn = await getPool().getConnection();
    const query = 'select image_filename from '+tableName+' where id = ?';
    const [rows] = await conn.query(query, [id]);
    conn.release();
    // Returns
    if (rows[0].image_filename === null) {
        return false;
    } else {
        return true;
    }
};

export{getImage,setImage,deleteImage,hasImage,imageExists}