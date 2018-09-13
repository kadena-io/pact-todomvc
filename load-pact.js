#!/usr/bin/env node
var fs = require('fs');
var pact = require('pact-lang-api');

var args = {};
var key = undefined;
process.argv.slice(2).forEach(function(v, i, a) {
  if (key) {
    args[key] = v;
    key = undefined;
  } else {
    if ((v[0] = '-')) {
      key = v.slice(1);
    }
  }
});
var usage =
  '\nload.js: create JSON for loading Pact code \n\n\
Arguments: [-cf codefile] [-c code] -n nonce -s sk -p pk [-df datafile] [-d data] \n\n\
  codefile    filepath containing pact code to load \n\
  code        pact code to execute \n\
  datafile    filepath containing JSON data to accompany pact code load \n\
  data        JSON string of data to accompany pact code load \n\
  nonce       nonce value for data payload \n\
  sk          secret key \n\
  pk          public key \n\
';

function die(msg) {
  console.error('ERROR: ' + msg);
  process.exit(1);
}
function dieu(msg) {
  die(msg + '\n\n' + usage);
}

function read(fp, cb) {
  fs.readFile(fp, 'utf8', function(err, data) {
    if (err) {
      die(err);
    }
    cb(data);
  });
}
function go(code, data) {
  var kp = { publicKey: args.p, secretKey: args.s };
  var msg = pact.simple.exec.createCommand(kp, args.n, code, JSON.parse(data));
  console.log(JSON.stringify(msg));
}

if (!args.cf && !args.c) {
  dieu('Missing code or codefile argument');
}
if (!args.n) {
  dieu('Missing nonce argument');
}
if (!args.s) {
  dieu('Missing sk argument');
}
if (!args.p) {
  dieu('Missing pk argument');
}

function doData(code) {
  if (args.df) {
    read(args.df, function(data) {
      go(code, data);
    });
  } else {
    if (args.d) {
      go(code, args.d);
    } else {
      go(code, '{}');
    }
  }
}

if (args.cf) {
  read(args.cf, doData);
} else {
  doData(args.c);
}
