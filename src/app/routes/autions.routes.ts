import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as middle from "../middleware/authorization.middleware"

import * as auctions from '../controllers/auctions.controller';

module.exports = (app: Express) => {
    app.route(rootUrl + '/auctions')
        .get(auctions.viewPaginated)
        .post(middle.isAuthorized,auctions.create);
}