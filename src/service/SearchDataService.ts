import CampusDao from '../db/dao/CampusDao';
import GenreTypeDao from '../db/dao/GenreTypeDao'
import { Kysely, sql, Transaction } from "kysely";
import Database from "../db/schema/Database";
import { ResultRow, Filters } from '../handler/SearchRouteHandler'


export default class SearchDataService {
    db: Kysely<Database>
    campusDao: CampusDao
    genreTypeDao: GenreTypeDao

    constructor(db: Kysely<Database>, campusDao: CampusDao, genreTypeDao: GenreTypeDao) {
        this.db = db
        this.campusDao = campusDao
        this.genreTypeDao = genreTypeDao
    }

    async retrieveMetadata(filters: any[], isbn: string, campus: string): Promise<ResultRow> {
        const campusId = await this.campusDao.convertCampusStringToId(campus)

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
        const campusId = await this.campusDao.convertCampusStringToId(campus)
        console.log(filters)

        try {
            const calculatedFilters = await this.addFiltersToQuery(filters)

            let dbQuery = this.db.selectFrom("books").distinct()
                .select('isbn_list')
                .innerJoin('inventory', 'inventory.book_id', 'books.id')
                .where('inventory.campus_id', '=', campusId)

            if (calculatedFilters.length > 0) {
                for (const filter of calculatedFilters) {
                    console.log('FILTER Returned:', filter)
                    dbQuery = dbQuery.where(filter.key, 'in', filter.value)
                }
            }

            const dbResult = await dbQuery.execute()
            
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

    private async addFiltersToQuery(filters: any[]): Promise<any[]> {
        let output = []
        
        if (filters != null) {


            for (let i = 0; i < filters.length; i++) {
                const targetKey = filters[i].queryKey
                const targetVal = filters[i].queryValue

                if (targetKey == 'Genre') {
                    const genreStrings = targetVal.split(",")
                    console.log('Genre Strings: ', genreStrings)

                    const genreIds = await Promise.all(
                        genreStrings.map(async (input) => {
                            return this.genreTypeDao.convertGenreStringToId(input);
                        })
                    );
                    
                    console.log('GenreIds: ', genreIds);
                    output.push({key: 'books.primary_genre_id', value: genreIds})
                }
                if (targetKey == 'Audience') {
                    // TODO
                }
            }
        }

        console.log('Output: ', output)
        return output
    }
}
