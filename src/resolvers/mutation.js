const LC = require('leanengine');

function saveLink(root, args) {
  const link = {
    id: 'link-id',
    title: args.title,
    url: args.url
  };
  return link;
}

const isBadPassword = (password) => password.length < 8;

async function signUp(root, args) {
  const user = new LC.User();
  const email = args.email;
  const password = args.password;
  user.setUsername(email);
  user.setPassword(password);
  user.setEmail(email);
  if (isBadPassword(password)) {
    throw new Error('ERROR_WEAK_PASSWORD');
  }
  try {
    const savedUser = await user.signUp();
    return {
      user: {
        id: savedUser.getObjectId(),
        email: savedUser.getEmail(),
        name: savedUser.getUsername()
      },
      token: savedUser.getSessionToken()
    };
  } catch (err) {
    switch (err.code) {
    case LC.Error.EMAIL_TAKEN:
      throw new Error('ERROR_EMAIL_TAKEN');
    case LC.Error.USERNAME_TAKEN:
      throw new Error('ERROR_EMAIL_TAKEN');
    case LC.Error.INVALID_EMAIL_ADDRESS:
      throw new Error('ERROR_INVALID_EMAIL');
    default:
      console.error('ERROR %d: %s', err.code, err);
      throw new Error('ERROR_UNKNOWN');
    }
  }
}

async function login(root, args) {
  try {
    const user = await LC.User.logIn(args.email, args.password);
    return {
      user: {
        id: user.getObjectId(),
        email: user.getEmail(),
        name: user.getUsername()
      },
      token: user.getSessionToken()
    };
  } catch (err) {
    // TODO: More fine-grained error handling
    console.error(err);
    throw new Error('ERROR_CREDENTIAL_REJECTED');
  }
}

module.exports = { saveLink, signUp, login };
