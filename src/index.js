const { GraphQLServer } = require('graphql-yoga');
const LC = require('leanengine');
const cors = require('cors');

LC.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

LC.Cloud.useMasterKey();

const resolvers = require('./resolvers');

const port = parseInt(process.env.PORT ||
  process.env.LEANCLOUD_APP_PORT || '4000');


const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => req
});

server.express.use(cors());
server.express.use(LC.express());
server.express.use(LC.Cloud.HttpsRedirect());


server.start({ port }, ({ port }) => {
  console.log(`Server is running on http://localhost:${port}`);
  process.on('uncaughtException', err => {
    console.error('Caught exception:', err.stack);
  });
  process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason.stack);
  });
});
