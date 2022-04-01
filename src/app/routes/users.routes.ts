import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as auth from "../middleware/authorization.middleware"

import * as users from '../controllers/users.controller';

module.exports = (app: Express) => {
    app.route(rootUrl + '/users/register')
        .post(users.register);
    app.route(rootUrl + '/users/login')
        .post(users.login);
    app.route(rootUrl + '/users/logout')
        .post(auth.isAuthorized, users.logout);
    app.route(rootUrl + '/users/:id')
        .get(users.viewUser)
        .patch(users.editUser)

}