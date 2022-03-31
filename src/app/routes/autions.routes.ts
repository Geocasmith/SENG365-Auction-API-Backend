import {Express} from "express";
import {rootUrl} from "./base.routes"

import * as auctions from '../controllers/auctions.controller';

module.exports = (app: Express) => {
    app.route(rootUrl + '/auctions')
        .get(auctions.viewPaginated)
        .post(auctions.create);
}