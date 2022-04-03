import express from "express";
import bodyParser from "body-parser"
import allowCrossOriginRequestsMiddleware from '../app/middleware/cors.middleware';
import Logger from "./logger";

export default () => {
    const app = express();
    // MIDDLEWARE
    app.use(allowCrossOriginRequestsMiddleware);
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ type: 'text/plain' }));  // for the /executeSql endpoint
    app.use(express.urlencoded({extended: true}));
    app.use(express.raw({type: '*/*'}));
    // Sets the bodyparser raw limit to 50mb for type image/png
    app.use(bodyParser.raw({ type: 'image/jpeg', limit: '50mb' }));
    app.use(bodyParser.raw({ type: 'image/png', limit: '50mb' }));
    app.use(bodyParser.raw({type: 'image/gif',limit: '50mb'}));


    // DEBUG (you can remove these)
    app.use((req, res, next) => {
        Logger.http(`##### ${req.method} ${req.path} #####`);
        next();
    });
    app.use(express.urlencoded());

    app.get('/', (req, res) =>{
        res.send({ 'message': 'Hello World!' })
    });

    // ROUTES
    require('../app/routes/backdoor.routes')(app);
    require('../app/routes/users.routes')(app);
    require('../app/routes/autions.routes')(app);
    // require('./modules.js')


    return app;

};
