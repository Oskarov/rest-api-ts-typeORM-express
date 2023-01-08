import * as express        from "express"
import * as bodyParser     from "body-parser"
import {Request, Response} from "express"
import {AppDataSource}     from "./data-source"
import {Routes}            from "./routes"
import * as morgan         from 'morgan';
import {config}            from "./config";
import {validationResult}  from "express-validator";

const handleErrors = (err, req, res, next) => {
    res.status(err.statusCode || 500).send({field: err.field, message: err.message});
}

AppDataSource.initialize().then(async () => {

    // create express app
    const app = express()
    app.use(morgan('combined'));
    app.use(bodyParser.json())

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, ...route.validation, async (req: Request, res: Response, next: Function) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({errors: errors.array()})
                }
                const result = await (new (route.controller as any))[route.action](req, res, next)
                res.json(result);
            } catch (e) {
                next(e);
            }
        })
    })

    app.use(handleErrors);

    app.listen(config.PORT);

}).catch(error => console.log(error))
