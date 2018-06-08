module.exports = {
  Query: require('./query'),
  Mutation: require('./mutation'),
  Link: {
    title: (root) => root.userTitle || root.title || root.url || ''
  }
};
