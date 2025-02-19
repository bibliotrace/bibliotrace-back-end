import CampusDao from '../db/dao/CampusDao';
import { Kysely, sql, Transaction } from "kysely";
import Database from "../db/schema/Database";
import { ResultRow, Filters } from '../handler/SearchRouteHandler'


export default class SearchDataService {
    db: Kysely<Database>
    campusDao: CampusDao

    constructor(db: Kysely<Database>, campusDao: CampusDao) {
        this.db = db
        this.campusDao = campusDao
    }

    async retrieveMetadata(isbn: string, campus: string): Promise<ResultRow> {
        const campusId = await this.convertCampusStringToId(campus)

        try {
            const dbResult = await this.db.selectFrom('books')
                .innerJoin('inventory', 'inventory.book_id', 'books.id')
                .leftJoin('genre_types', 'books.primary_genre_id', 'genre_types.id')
                .leftJoin('series', 'series.id', 'books.series_id')
                .select(['books.id', 'books.book_title', 'books.author', 'genre_types.genre_name', 'series.series_name'])
                .where('inventory.campus_id', '=', campusId)
                .where('books.isbn_list', 'like', `%${isbn}%`)
                .executeTakeFirst()

            if (dbResult != null) {
                return {
                    id: String(dbResult.id),
                    title: dbResult.book_title,
                    author: dbResult.author ?? 'Unknown',
                    genre: dbResult.genre_name,
                    series: dbResult.series_name ?? 'None',
                    isbn
                }
            } else {
                return null
            }
        } catch (error) {
            throw new Error(`Error trying to retrieve metadata for book: ${error.message}`)
        }
        
    }

    async retrieveAllISBNs(filters: any[], campus: string): Promise<string[]> {
        const campusId = await this.convertCampusStringToId(campus)

        try {
            const dbResult = await this.db.selectFrom("books").distinct()
                .select('isbn_list')
                .innerJoin('inventory', 'inventory.book_id', 'books.id')
                .where('inventory.campus_id', '=', campusId)
                .execute()
            
            console.log('DB RESULT FOR all ISBNs: ', dbResult)

            if (dbResult != null) {
                return dbResult.flatMap((input) => { return input.isbn_list })
            } else {
                throw new Error('dbResult was null for some reason!')
            }
        } catch (error) {
            throw new Error(`Error trying to retreive all ISBN's: ${error.message}`)
        }
    }

    private async convertCampusStringToId(campus: string): Promise<number> {
        try {
            const campusResult = await this.campusDao.getByKeyAndValue('campus_name', campus)
            if (campusResult != null && campusResult.object != null && campusResult.statusCode === 200) {
                return campusResult.object.id
            }
        } catch (error) {
            throw new Error(`Error trying to get campus ID from campus string: ${error.message}`)
        }
    }
}
