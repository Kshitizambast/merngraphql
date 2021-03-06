const { UserInputError, AuthenticationError } = require('apollo-server')
const Post = require('../../models/Post')
const checkAuth = require('../../utils/check-auth')

module.exports = {
    Mutation: {
        async createComment(_, { postId, body }, context){
            const { username } = checkAuth(context) 
            if(body.trim() === ''){
                throw new UserInputError('Empty Comment', {
                    errors:{
                        body: 'Comment body must not be empty'
                    }
                })
            }

            const post  = await Post.findById(postId)

            if(post){
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                })
                await post.save()
                return post
            } else throw new UserInputError('Post not found')
        },

        async deleteComment(_, {postId, commentId}, context){
            const { username } = checkAuth(context)

            const post = await Post.findById(postId)

            if(post){
                const commentIndex = post.comments.findIndex(c => c.id === commentId)

                if(post.comments[commentIndex].username === username){
                    post.comments.slice(commentIndex, 1)
                    await post.save()
                    return post
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } else throw new UserInputError('Post not found')
        },

        async likePost(_, {postId}, context){
            const { username } = checkAuth(context)

            const post  = await Post.findById(postId)

            if(post){
                if(post.likes.find(like => like.username === username)){
                    //Post already liked, unlike it
                    post.likes = post.likes.filter(like => like.username !== username)
                } else {
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }

                await post.save()
                return post
            } else throw new UserInputError('Post not found')
        }
    }
}