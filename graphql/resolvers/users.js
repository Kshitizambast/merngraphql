const { UserInputError } = require('apollo-server')
const bcrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')

const { validateRegisterInput, validateLoginInput } = require('../../utils/validation')

const { SECRET_KEY }  = require('../../config/keys')
const User = require('../../models/User')


const generateToken = (user) => {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, {expiresIn: '1h'})

    return token
}

module.exports = {
    Mutation:{
    async login(_, {username, password}, context, info){
        const { valid, errors } = validateLoginInput(username, password)
        if(!valid){
            throw new UserInputError('Errors', {errors})
        }
        const user = await User.findOne({username})
        if(!user){
            errors.general  = "User not found"
            throw new UserInputError('User not found', {errors})
        }
      
        const token = generateToken(user)
        return{
            ...user._doc,
            id: user._id,
            token

        }

    },
    async register(_, 
                    { 
                        registerInput: {username, email, password, confirmPassword}
                    }, context, info){
            //Validate User Data
           const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)
            //Check for existance of user
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }
            
            const user = await User.findOne({ username })
            if(user){
                throw new UserInputError('Username is already taken', {
                    errors: {
                        username: 'This username is already taken'
                    }
                })
            }


            //Hash password and create auth token

            password = await bcrypt.hash(password, 12)

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            })

            const res = await newUser.save()

            const token = generateToken(res)


            return{
                ...res._doc,
                id: res._id,
                token

            }
        }
    }
}