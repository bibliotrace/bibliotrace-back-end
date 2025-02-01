import dotenv from "dotenv"
import MySQLDao from "./db/dao/MySQLDao"
import IsbnService from "./services/IsbnService"
import SearchRouteHandler from "./handlers/SearchRouteHandler"

class Deps {
    dependencies: DepsObject

    constructor() {
        this.dependencies = {}
    }
        
    async setup(): Promise<DepsObject> {
        dotenv.config()

        this.dependencies.db = new MySQLDao();
        await this.dependencies.db.connect()

        this.dependencies.isbnService = new IsbnService(this.dependencies.db)

        this.dependencies.searchRouteHandler = new SearchRouteHandler(this.dependencies.db, this.dependencies.isbnService)

        console.log('Dependencies Instantiated')
        return {
            db: this.dependencies.db,
            isbnService: this.dependencies.isbnService,
            searchRouteHandler: this.dependencies.searchRouteHandler,
        }
    }
}

export interface DepsObject {
    db?: MySQLDao,
    isbnService?: IsbnService,
    searchRouteHandler?: SearchRouteHandler
}

export default Deps
