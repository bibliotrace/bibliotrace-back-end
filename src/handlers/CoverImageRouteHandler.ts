

export class CoverImageRouteHandler {
    constructor () {}

    async relayImage (isbn: string) {
        let imageURL = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
        let response = await fetch(imageURL)

        if (!response.ok) {
            console.log(`Cover URL: ${imageURL}; Status Code: ${response.status}; Body: ${response.body}`)
        }

        let buffer = await response.arrayBuffer()
        if (buffer.byteLength >= 100) {
            return Buffer.from(buffer)    
        }

        const lookupURL = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
        response = await fetch(lookupURL)

        if (!response.ok) {
            console.log(`Lookup URL: ${lookupURL}; Status Code: ${response.status}; Body: ${response.body}`)
        }

        const responseJSON = await response.json()
        imageURL = responseJSON.items[0].volumeInfo.imageLinks.thumbnail

        response = await fetch(imageURL)

        if (!response.ok) {
            console.log(`Cover URL: ${imageURL}; Status Code: ${response.status}; Body: ${response.body}`)
        }

        buffer = await response.arrayBuffer()
        if (buffer.byteLength >= 100) {
            return Buffer.from(buffer)
        } 

        return {}
    }
}