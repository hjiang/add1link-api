const links = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  title: 'Fullstack tutorial for GraphQL'
}];

module.exports = {
  Query: {
    info: () => 'This is the API of SavedLinks',
    feed: () => links
  },
  Mutation: require('./mutation')
};
