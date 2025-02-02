import MySQL from "../db/interactors/MySQL"
import IsbnService from "../services/IsbnService"
import { DynamoDb } from "../db/interactors/DynamoDb"


export default class SearchRouteHandler {
    db: MySQL
    isbn: IsbnService
    dynamoDb: DynamoDb

    constructor(db: MySQL, isbn: IsbnService, dynamoDb) {
        this.db = db
        this.isbn = isbn
        this.dynamoDb = dynamoDb
    }

    async conductSearch (inputQuery: string): Promise<SearchResults> {
        const extractedObject = this.extractFilters(inputQuery)
        const extractedFilters = extractedObject.queryList // TODO: Do something with this...
        const extractedQuery = extractedObject.inputQuery

        let isbnResult: any = await this.dynamoDb.checkISBNQueryCache(extractedQuery)
        if (isbnResult == null) {
            console.log(`Submitting Query to ISBN: ${extractedQuery}`)
            isbnResult = await this.isbn.conductSearch(extractedQuery)
            await this.dynamoDb.updateISBNQueryCache(extractedQuery, isbnResult.toString())
        }
        
        console.log(`Completed Search Query: ${inputQuery}`)
        return { results: isbnResult }
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