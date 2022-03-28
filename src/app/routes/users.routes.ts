import {Express} from "express";
import {rootUrl} from "./base.routes"

import * as users from '../controllers/user.controller';

module.exports = (app: Express) => {
    app.route(rootUrl + '/users/register')
        .post(users.register);
    app.route(rootUrl + '/users/login')
        .post(users.login);
}