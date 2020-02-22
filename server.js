const { ApolloServer } = require("apollo-server");

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const { findOrCreateUser } = require("./controllers/userController");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log("DB connected"))
  .catch(err => console.error("ERROR FOR MONGO", err));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection:true,
  playground:true,
  context: async ({ req }) => {
    let authToken = null;
    let currentUser = null;
    try {
      if (req) {
        authToken = req.headers.authorization;
        currentUser = await findOrCreateUser(authToken);
      }
    } catch (err) {
      console.error(
        "Unable to authenticate user with token"
      );
      console.error({ err });
    }
    return { currentUser };
  }
});

server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => console.log(url));