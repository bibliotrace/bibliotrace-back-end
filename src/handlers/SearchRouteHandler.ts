import MySQLDao from "../db/dao/MySQLDao"
import IsbnService from "../services/IsbnService"


export default class SearchRouteHandler { // TODO/Feature Request: Cache calls to the ISBNdb API to save requests for new queries
    db: MySQLDao
    isbn: IsbnService

    constructor(db: MySQLDao, isbn: IsbnService) {
        this.db = db
        this.isbn = isbn
    }

    async conductSearch (inputQuery: string): Promise<SearchResults> {
        const extractedObject = this.extractFilters(inputQuery)
        const extractedFilters = extractedObject.queryList
        const extractedQuery = extractedObject.inputQuery
        
        let isbnResult

        // TODO: Right here, check the cache for the extractedQuery to see if it's new
        if (false) {
            // if true, use what came back from the cached result from ISBN
        } else {
            isbnResult = await this.isbn.conductSearch(extractedQuery)
            
        }
        
        

        




        return { results: [] }
    }



    private findIndexes (inputString: string): any {
        let firstDelimiterIndex = -1
        let secondDelimiterIndex = -1
        let seperatorIndex = -1

        if (inputString.length < 5) {
            return undefined
        }

        for (let i = 0; i < inputString.length; i++) {
            if (i < inputString.length - 1) {
                if (inputString[i] === '|' && inputString[i+1] === '|') {
                    if (firstDelimiterIndex === -1) {
                        firstDelimiterIndex = i+1 // give the index of the left |
                    } else if (secondDelimiterIndex === -1) {
                        secondDelimiterIndex = i // give the index of the right |
                    }

                    i += 1
                } else if (inputString[i] === ':') {
                    if (seperatorIndex === -1) {
                        seperatorIndex = i
                    }
                }
            }
        }

        if (firstDelimiterIndex !== -1 && secondDelimiterIndex !== -1 && seperatorIndex !== -1) {
            return {firstDelimiterIndex, seperatorIndex, secondDelimiterIndex}
        }
    }

    private extractFilters (inputQuery: string) {
        let queryIndexes = this.findIndexes(inputQuery)
        const queryList = []

        while (queryIndexes != null) {
            let queryKey = inputQuery.slice(queryIndexes.firstDelimiterIndex + 1, queryIndexes.seperatorIndex)
            let queryValue = inputQuery.slice(queryIndexes.seperatorIndex + 1, queryIndexes.secondDelimiterIndex)
            queryList.push({queryKey, queryValue})

            inputQuery = inputQuery.slice(queryIndexes.secondDelimiterIndex + 2, inputQuery.length)
            queryIndexes = this.findIndexes(inputQuery)
        }

        return { queryList, inputQuery }
    }




}

export interface SearchResults {
    results: ResultRow[]
}

export interface ResultRow {
    title: string | undefined,
    author: string | undefined, 
    genre: string | undefined, 
    series: string | undefined,
    coverImageCallback: string | undefined
}