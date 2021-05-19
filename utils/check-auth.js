const { AuthenticationError } = require('apollo-server')

const {SECRET_KEY} = require('../config/keys')
const jwt  = require('jsonwebtoken')

module.exports = (context) => {
    const authHeader = context.req.headers.authorization;
    
    if(authHeader){
        //Bearer..
        const token = authHeader.split('Bearer ')[1]
        if(token){
            try {
                const user  = jwt.verify(token, SECRET_KEY)
                return user
            } catch (error) {
                 throw new AuthenticationError('Invalid/Expired token')
            }
        }
        throw new Error('Authetication token must be \'Bearer [token]')
    }
    throw new Error('Authorization header must be provided')
}