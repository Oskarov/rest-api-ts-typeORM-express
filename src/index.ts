import {AppDataSource} from "./data-source"
import app             from './app';
import {config}        from "./config";

AppDataSource.initialize().then(async () => {
    app.listen(config.PORT);
}).catch(error => console.log(error))
