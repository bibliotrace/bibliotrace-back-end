import jwt from 'jsonwebtoken'

export class UserAuthService {

    constructor() {

    }

    async login (username: string, password: string): Promise<string> {
        const role = await this.getUserRole(username, password)
        return await this.buildJWT(role)
    }

    async buildJWT (userRole: UserRole) {
        const token = jwt.sign({ userRole }, process.env.AUTH_KEY ?? 'hello world!', { expiresIn: '1h' })
        console.log(`Token Generated: ${token}`)
        return token
    }

    async getUserRole (username: string, password: string): Promise<UserRole> {
        //TODO: make a call to sql db to get the user role associated with the login

        return { campus: 'Lehi', roleType: 'Admin' }
    }

}

export interface UserRole {
    campus: string,
    roleType: string
}