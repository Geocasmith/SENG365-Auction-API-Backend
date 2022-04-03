import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as middle from "../middleware/authorization.middleware"

import * as auctions from '../controllers/auctions.controller';

module.exports = (app: Express) => {
    app.route(rootUrl + '/auctions/:id')
        .get(auctions.getAuction)
        .patch(middle.isAuthorized,middle.isAuctionOwner,auctions.update)
        .delete(middle.isAuthorized,middle.isAuctionOwner,auctions.removeAuction);
    app.route(rootUrl + '/auctions/:id/image')
        .get(auctions.getImage)
        .put(middle.isAuthorized,middle.isAuctionOwner,auctions.uploadImage);
    app.route(rootUrl + '/auctions')
        .get(auctions.viewPaginated)
        .post(middle.isAuthorized,auctions.create);
    app.route(rootUrl + '/auctions/categories')
        .get(auctions.getCategories);
        // .put(middle.isAuthorized,auctions.update)
        // .delete(middle.isAuthorized,auctions.delete);
    app.route(rootUrl + '/auctions/:id/bids')
        .get(auctions.getBids)
        .post(middle.isAuthorized,auctions.placeBid);
}