import {getPool} from "../../config/db";
import Logger from "../../config/logger";
const imageDirectory = './storage/images/';

const getUserImages = async(userId:number): Promise<any> => {
    // Get the user's image_filename from the database
    Logger.info('Get users image from db');
    const conn = await getPool().getConnection();
    const query = 'select image_filename from user where id = ?';
    const [rows] = await conn.query(query, [userId]);
    conn.release();
    return rows;
};

const deleteImage = async(userId:number): Promise<any> => {
    Logger.info('Deleting users image from db');
    const conn = await getPool().getConnection();
    const query = 'update user set image_filename = null where id = ?';
    const [rows] = await conn.query(query, [userId]);
    conn.release();
    return rows;
};

export{getUserImages,deleteImage}