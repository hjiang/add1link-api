const LC = require('leanengine');

async function getUser(ctx) {
  const token = ctx.request.get('Authorization');
  if (!token) {
    throw new Error('ERROR_UNAUTHORIZED');
  } else {
    try {
      const user = await LC.User.become(token);
      return user;
    } catch(err) {
      throw new Error('ERROR_UNAUTHORIZED');
    }
  }
}

function mapLinkToJson(link) {
  return {
    url: link.get('url'),
    title: link.get('title'),
    id: link.getObjectId(),
    createdAt: link.get('createdAt'),
    userTitle: link.get('userTitle')
  };
}

module.exports = { getUser, mapLinkToJson };
