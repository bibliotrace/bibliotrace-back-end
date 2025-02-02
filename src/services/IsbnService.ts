import MySQL from "../db/interactors/MySQL"
import { sanitizeUrl } from '@braintree/sanitize-url'

class IsbnService {
    async conductSearch(inputQuery: string): Promise<string[]> {
        const result = await fetch(`${process.env.ISBN_HOST}/books/${sanitizeUrl(inputQuery)}?pageSize=40`, {
            method: 'GET',
            headers: {
                'Authorization': process.env.ISBN_KEY
            }
        })
        if (!result.ok) {
            throw new Error(`Call to ISBNdb Not Ok, status: ${result.status}, body: ${await result.text()}`)
        }
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