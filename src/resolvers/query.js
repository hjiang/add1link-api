const LC = require('leanengine');
const { getUser, mapLinkToJson } = require('./utils');

async function feed(root, args, ctx) {
  let { beforeTimestamp, limit } = args;
  const user = await getUser(ctx);
  const query = new LC.Query('Link');
  if (beforeTimestamp) {
    query.lessThan('createdAt', new Date(parseInt(beforeTimestamp)));
  }
  
  query.equalTo('user', user).descending('createdAt')
    .limit(limit || 50);
  const links = await query.find();
  let nextTimestamp = Date.now().valueOf();
  if (links.length > 0) {
    nextTimestamp = links[links.length - 1].get('createdAt').valueOf();
  }
  return {
    links: links.map(link => mapLinkToJson(link)),
    nextTimestamp
  };
}

const search = async (root, args, ctx) => {
  const { query, limit, sid } = args;
  const user = await getUser(ctx);
  const searchQuery = new LC.SearchQuery('Link');
  searchQuery.queryString(`user.objectId:${user.getObjectId()} AND (${query})`);
  searchQuery.limit(limit || 20);
  if (sid) searchQuery.sid(sid);
  const results = await searchQuery.find();
  return {
    links: results.map(link => mapLinkToJson(link)),
    hasMore: searchQuery.hasMore(),
    sid: searchQuery._sid
  };
};

module.exports = { feed, search };
