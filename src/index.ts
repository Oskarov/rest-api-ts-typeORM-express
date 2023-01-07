import * as express        from "express"
import * as bodyParser     from "body-parser"
import {Request, Response} from "express"
import {AppDataSource}     from "./data-source"
import {Routes}            from "./routes"
import {User}              from "./entity/User";

const handleErrors = (err, req, res, next) => {
    res.status(err.statusCode || 500).send({field: err.field, message: err.message});
}

AppDataSource.initialize().then(async () => {

    // create express app
    const app = express()
    app.use(bodyParser.json())

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, async (req: Request, res: Response, next: Function) => {
            try {
                const result = await (new (route.controller as any))[route.action](req, res, next)
                res.json(result);
            } catch (e) {
                next(e);
            }
        })
    })

    app.use(handleErrors);

    app.listen(3000)

}).catch(error => console.log(error))
