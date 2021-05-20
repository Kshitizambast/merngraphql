const { ApolloServer, PubSub }  = require('apollo-server')
const mongoose  = require('mongoose')



const typeDefs = require('./graphql/typeDefs');
const { MONGODB } = require('./config/keys')
const resolvers = require('./graphql/resolvers')

const pubsub = new PubSub()

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context : ({ req }) => ({ req })
})

//Setup DB and server.
mongoose.connect(MONGODB,  { useNewUrlParser: true  })
        .then(() => {
            console.log('Connected to DB')
            return server.listen({ port: 5000})
        })
        .then((res) => {
            console.log(`Server is running at ${res.url}`)
        })
