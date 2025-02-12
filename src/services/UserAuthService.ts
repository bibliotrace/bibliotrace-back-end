import jwt from 'jsonwebtoken'
import UserDao from '../db/interactors/UserDao'
import UserRoleDao from '../db/interactors/UserRoleDao'
import { User } from '../db/schema/User'
import argon2 from 'argon2'
import { isMessage } from '../message/Message';
import CampusDao from '../db/interactors/CampusDao';


export class UserAuthService {
    private readonly campusDao: CampusDao
    private readonly userDao: UserDao
    private readonly userRoleDao: UserRoleDao

    constructor(campusDao, userDao, userRoleDao) {
        this.campusDao = campusDao
        this.userDao = userDao
        this.userRoleDao = userRoleDao
    }

    async login (username: string, password: string): Promise<string> {
        const userResult = await this.userDao.getByPrimaryKey(username)

        if (userResult == null || isMessage(userResult)) {
            console.log('User Doesn\'t Exist!')
            return null
        }

        const realHash = await argon2.verify(userResult.password_hash, password)
        if (realHash) {
            const role = await this.getUserRole(username, userResult)
            return await this.buildJWT(role)
        } else {
            console.log('Password Is Wrong')
            return null
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
        
        await this.userDao.create(newUserObject)
    }

    async updateUser (username: string, password: string, role: UserJWTData) {
        // First look up the user, make sure they exist
        const userObject = await this.userDao.getByPrimaryKey(username)

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

        await this.userDao.update(username, newUserObject)
    }

    async deleteUser (username: string) {
        // First look up the user, make sure they exist
        const userObject = await this.userDao.getByPrimaryKey(username)

        if (isMessage(userObject)) {
            console.log(JSON.stringify(userObject))
            throw new Error('In DeleteUser: Received a message instead of a user object')
        }

        if (userObject == null) {
            throw new Error('User Not Found')
        }

        await this.userDao.delete(username)
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
        const campus = await this.campusDao.getByPrimaryKey(userData.campus_id)
        const roleType = await this.userRoleDao.getByPrimaryKey(userData.role_id)
        const email = userData.email

        if (isMessage(roleType) || isMessage(campus)) {
            throw new Error('Role Type or Campus Mismatch, Message was returned')
        }

        return { campus: campus.name, roleType: roleType.name, email }
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

    private async getCampusAndRoleIDs (campus: string, roleType: string) {
        // First match user role data to db schema
        const campusObject = await this.campusDao.getByKeyAndValue('name', campus)
        const userRole = await this.userRoleDao.getByKeyAndValue('name', roleType)

        if (campusObject == null || userRole == null || isMessage(campusObject) || isMessage(userRole)) {
            throw new Error(`Problem Getting User Role or Campus ID: campusObject = ${JSON.stringify(campusObject)}, userRole = ${JSON.stringify(userRole)}`)
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