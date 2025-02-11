import jwt from 'jsonwebtoken'
import UserDao from '../db/interactors/UserDao'
import UserRoleDao from '../db/interactors/UserRoleDao'
import { User } from '../db/schema/User'
import argon2 from 'argon2'
import Message, { isMessage } from '../message/Message';
import CampusDao from '../db/interactors/CampusDao';


export class UserAuthService {

    constructor() {
    }

    async login (username: string, password: string): Promise<string> {
        console.log('made it here!')

        const userResult = await UserDao.getByPrimaryKey(username)

        console.log(userResult)

        if (userResult == null || isMessage(userResult)) {
            throw new Error('User Doesn\'t Exist!')
        }

        const realHash = await this.verifyPassword(password, userResult.password_hash)
        if (realHash) {
            const role = await this.getUserRole(username, userResult)
            return await this.buildJWT(role)
        } else {
            throw new Error('Password Is Wrong')
        }
    }

    async createUser (username: string, password: string, role: UserJWTData) {
        // First grab id's
        const { campusId, roleId } = await this.getCampusAndRoleIDs(role.campus, role.roleType)

        // Then make and send off the new user object
        const newUserObject = {
            username,
            password_hash: await this.hashPassword(password),
            role_id: roleId, 
            email: role.email,
            campus_id: campusId
        }
        
        await UserDao.create(newUserObject)
    }

    async updateUser (username: string, password: string, role: UserJWTData) {
        // First look up the user, make sure they exist
        const userObject = await UserDao.getByPrimaryKey(username)

        if (isMessage(userObject)) {
            console.log(JSON.stringify(userObject))
            throw new Error('In UpdateUser: Received a message instead of a user object')
        }

        // Next grab id's
        const { campusId, roleId } = await this.getCampusAndRoleIDs(role.campus, role.roleType)

        // Next populate everything with the latest information
        const newUserObject = {
            username, 
            password_hash: (password == null) ? userObject.password_hash : await this.hashPassword(password),
            role_id: roleId,
            email: role.email,
            campus_id: campusId
        }

        await UserDao.update(username, newUserObject)
    }

    async deleteUser (username: string) {
        // First look up the user, make sure they exist
        const userObject = await UserDao.getByPrimaryKey(username)

        if (isMessage(userObject)) {
            console.log(JSON.stringify(userObject))
            throw new Error('In DeleteUser: Received a message instead of a user object')
        }

        await UserDao.delete(username)
    }

    private async buildJWT (userRole: UserJWTData) {
        let token
        if (userRole.roleType === 'Admin') {
            token = jwt.sign({ userRole }, process.env.AUTH_KEY ?? 'hello world!', { expiresIn: '6d' })
        } else {
            token = jwt.sign({ userRole }, process.env.AUTH_KEY ?? 'hello world!', { expiresIn: '1h' })
        }
        console.log(`Token Generated: ${token}`)
        return token
    }

    private async getUserRole (username: string, userData: User): Promise<UserJWTData> {
        const campus = await CampusDao.getByPrimaryKey(userData.campus_id)
        const roleType = await UserRoleDao.getByPrimaryKey(userData.role_id)
        const email = userData.email

        if (isMessage(roleType) || isMessage(campus)) {
            throw new Error('Role Type or Campus Mismatch, Message was returned')
        }

        return { campus: campus.name, roleType: roleType.role, email }
    }

    private async hashPassword(password: string): Promise<string> {
        try {
            const hash = await argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 16, // 64MB
                timeCost: 3, // Iterations
                parallelism: 2, // Number of threads
            });
            return hash;
        } catch (error) {
            throw new Error("Error hashing password: " + error.message);
        }
    }

    private async verifyPassword(password: string, dbHash: string): Promise<boolean> {
        return await argon2.verify(dbHash, password)
    }

    private async getCampusAndRoleIDs (campus: string, roleType: string) {
        // First match user role data to db schema
        const campusObject = await CampusDao.getByKeyAndValue('name', campus)
        const userRole = await UserRoleDao.getByKeyAndValue('role', roleType)

        if (isMessage(campusObject) || isMessage(userRole)) {
            console.log(JSON.stringify(campus))
            console.log(JSON.stringify(userRole))
            throw new Error('Problem Getting User Role or Campus ID')
        } else {
            return {
                campusId: campusObject.id,
                roleId: userRole.id
            }
        }
    }
}

export interface UserJWTData {
    campus: string,
    roleType: string,
    email: string
}