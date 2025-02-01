import MySQLDao from "../db/dao/MySQLDao"
import { sanitizeUrl } from '@braintree/sanitize-url'



class IsbnService {
    dao: MySQLDao

    constructor (dao: MySQLDao) {
        this.dao = dao
    }

    async conductSearch(inputQuery: string): Promise<string[]> {
        const result = await fetch(`${process.env.ISBN_HOST}/books/${sanitizeUrl(inputQuery)}?pageSize=1000`, {
            method: 'GET',
            headers: {
                'Authorization': process.env.ISBN_KEY
            }
        })
        const resultJson = await result.json()

        const isbnList = []
        resultJson.books.map(result => {
            if (result.isbn10 != null) isbnList.push(result.isbn10)
            if (result.isbn13 != null) isbnList.push(result.isbn13)
        })

        return isbnList
    }

}

export default IsbnService