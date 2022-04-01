// @ts-ignore
import * as express from "express"

declare global {
    namespace Express {
        interface Request {
            userID?: number
        }
    }
}