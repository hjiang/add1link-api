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

module.exports = { feed };
