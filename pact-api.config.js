const crypto = require('crypto');

const NONCE_LENGTH = 32;
const CONTACTS_ADMIN_PUB_KEY = '06c9c56daa8a068e1f19f5578cdf1797b047252e1ef0eb4a1809aa3c2226f61e';
// const SEC_KEY = '7ce4bae38fccfe33b6344b8c260bffa21df085cf033b3dc99b4781b550e1e922';

function getRandomChar() {
  // range of a-9 char codes = 48-90
  return String.fromCharCode(Math.floor(Math.random() * (90 - 48)) + 48);
}

function makeNonce() {
  let nonce = '';
  while (nonce.length < NONCE_LENGTH) {
    nonce += getRandomChar();
  }
  const hash = crypto.createHash('sha512', nonce);
  hash.update(nonce);
  return hash.digest('hex');
}

//   ...Pact.crypto.genKeyPair(),

module.exports = {
  publicKey: CONTACTS_ADMIN_PUB_KEY,
  secretKey: '7ce4bae38fccfe33b6344b8c260bffa21df085cf033b3dc99b4781b550e1e922',
  nonce: makeNonce(),
  data: {
    'contacts-admin-keyset': {
      keys: [CONTACTS_ADMIN_PUB_KEY],
      pred: '=',
    },
  },
};
