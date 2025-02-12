import GenreTypeDao from "../db/dao/GenreTypeDao";
import { Genres } from "../db/schema/Genres";


export default class GenreRouteHandler {
    private readonly genretypeDao: GenreTypeDao

    constructor(genreTypeDao) {
        this.genretypeDao = genreTypeDao;
    }

    async getGenres(): Promise<string[]> {
        const result = await this.genretypeDao.getAll()

        if (result.statusCode != 200 || result.object == null) {
            throw new Error(`Error retrieving data from the Genres table: ${result.statusCode}: ${result.message}`);
        }

        console.log(result.object)
        
        return result.object.map(item => { return item.name })
    }



}