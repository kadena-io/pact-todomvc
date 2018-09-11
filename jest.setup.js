global.fetch = require('jest-fetch-mock');
global.API_HOST = '';
global.PACT_API_CONFIG = {
  publicKey: '123',
  secretKey: 'abc',
  nonce: Date.now(),
  data: {
    'contacts-admin-keyset': {
      keys: ['123'],
      pred: '=',
    },
  },
};
