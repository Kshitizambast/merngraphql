const { AuthenticationError, UserInputError } = require('apollo-server')
const { argsToArgsConfig } = require('graphql/type/definition')
const Post = require('../../models/Post')

const checkAuth  = require('../../utils/check-auth')

module.exports = {
    Query: {
       async getPosts(){
            try{
                const post = await Post.find().sort({ createdAt: -1 })
                return post
            } catch(err){
                throw new Error(err)
            }
       },

       async getPost(_, { postId }){
           try{
               const post = await Post.findById(postId)
               if(post){
                    return post
               }
               else{
                   throw new Error('Post not found')
               }

           } catch(err){
               throw new Error(err)
           }
       }
    },

    //Mutations
    Mutation: {
        async createPost(_, {body}, context){

            const user = checkAuth(context)

            if(args.body.trime() === '')
                throw new UserInputError('Body must not be empty')
            
            const newPost = new Post()

            newPost.body = body
            newPost.user = user.id
            newPost.username = user.username
            newPost.createdAt = new Date().toISOString()

            


            // const newPost = Post.create({
            //     body,
            //     user: user.id,
            //     username: user.username,
            //     createdAt: new Date().toISOString()
            // })

            const post  = await newPost.save()
            return post
        },

        async deletePost(_, {postId}, context){
            const user = checkAuth(context)

            try {
                const post = await Post.findById(postId)

                if(user.username === post.username){
                    await post.delete()
                    return 'Post is deleted'
                }else{
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (error) {
                throw new Error(error)
            } 
        }
    }
}