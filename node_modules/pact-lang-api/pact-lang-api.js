/** pact-lang-api.js
 * Exports functions to support Pact API calls.
 * Author: Will Martino, Hee Kyun Yun, Stuart Popejoy
 * Supports: Pact API 3.0 v1
 */

const blake = require("blakejs");
const nacl = require("tweetnacl");
const base64url = require("base64-url");

/**
 * Convert binary to hex.
 * @param s {Uint8Array} - binary value
 * @return {string} hex string
 */
var binToHex = function(s) {
  var constructor = s.constructor.name || null;

  if (constructor !== "Uint8Array") {
    throw new TypeError("Expected Uint8Array");
  }

  return Buffer.from(s).toString("hex");
};

/**
 * Convert hex string to binary.
 * @param s {string} - hex string
 * @return {Uint8Array} binary value
 */
var hexToBin = function(h) {
  if (typeof h !== "string") {
    throw new TypeError("Expected string: " + h);
  }
  return new Uint8Array(Buffer.from(h, "hex"));
};

/**
 * Perform blake2b256 hashing.
 */
var hashBin = function(s) {
  return blake.blake2b(s, null, 32);
};

/**
 * Perform blake2b256 hashing, encoded as unescaped base64url.
 */
var hash = function(s) {
  return base64UrlEncode(hashBin(s));
};

/**
 * Hash string as unescaped base64url.
 */
var base64UrlEncode = function(s) {
  return base64url.escape(base64url.encode(s));
};

/**
 * Generate a random ED25519 keypair.
 * @return {object} with "publicKey" and "secretKey" fields.
 */
var genKeyPair = function() {
  var kp = nacl.sign.keyPair();
  var pubKey = binToHex(kp.publicKey);
  var secKey = binToHex(kp.secretKey).slice(0, 64);
  return { publicKey: pubKey, secretKey: secKey };
};

var toTweetNaclSecretKey = function(keyPair) {
  if (
    !keyPair.hasOwnProperty("publicKey") ||
    !keyPair.hasOwnProperty("secretKey")
  ) {
    throw new TypeError(
      "Invalid KeyPair: expected to find keys of name 'secretKey' and 'publicKey': " +
        JSON.stringify(keyPair)
    );
  }
  return hexToBin(keyPair.secretKey + keyPair.publicKey);
};

/**
 * Sign data using key pair.
 * @param msg - some data to be passed to blake2b256.
 * @param keyPair - signing ED25519 keypair
 * @return {object} with "hash", "sig" (signature in hex format), and "pubKey" public key value.
 */
var sign = function(msg, keyPair) {
  if (
    !keyPair.hasOwnProperty("publicKey") ||
    !keyPair.hasOwnProperty("secretKey")
  ) {
    throw new TypeError(
      "Invalid KeyPair: expected to find keys of name 'secretKey' and 'publicKey': " +
        JSON.stringify(keyPair)
    );
  }
  var hshBin = hashBin(msg);
  var hsh = base64UrlEncode(hshBin);
  var sigBin = nacl.sign.detached(hshBin, toTweetNaclSecretKey(keyPair));
  return { hash: hsh, sig: binToHex(sigBin), pubKey: keyPair.publicKey };
};

var pullSig = function(s) {
  if (!s.hasOwnProperty("sig")) {
    throw new TypeError(
      "Expected to find keys of name 'sig' in " + JSON.stringify(s)
    );
  }
  return { sig: s.sig };
};

var pullAndCheckHashs = function(sigs) {
  var hsh = sigs[0].hash;
  for (var i = 1; i < sigs.length; i++) {
    if (sigs[i].hash !== hsh) {
      throw new Error(
        "Sigs for different hashes found: " + JSON.stringify(sigs)
      );
    }
  }
  return hsh;
};

/**
 * Prepare an ExecMsg pact command for use in send or local execution.
 * To use in send, wrap result with 'mkSingleCommand'.
 * @param keyPairs {array or object} - array or single ED25519 keypair
 * @param nonce {string} - nonce value for ensuring unique hash
 * @param pactCode {string} - pact code to execute
 * @param envData {object} - JSON message data for command
 * @param meta {object} - meta information, see mkMeta
 * @return valid pact API command for send or local use.
 */
var prepareExecCmd = function(keyPairs, nonce=new Date().toISOString(), pactCode, envData, meta=mkMeta("","",0,0)) {
  enforceType(nonce, "string", "nonce");
  enforceType(pactCode, "string", "pactCode");

  var kpArray = asArray(keyPairs);
  var signers = kpArray.map(mkSigner);
  var cmdJSON = {
    nonce: nonce,
    payload: {
      exec: {
        code: pactCode,
        data: envData || {}
      }
    },
    signers: signers,
    meta: meta
  };
  var cmd = JSON.stringify(cmdJSON);
  var sigs = kpArray.map(function(kp) {
    return sign(cmd, kp);
  });
  return mkSingleCmd(sigs, cmd);
};

/**
 * Makes a single command given signed data.
 * @param sigs {array} - array of signature objects, see 'sign'
 * @param cmd {string} - stringified JSON blob used to create hash
 * @return valid Pact API command for send or local use.
 */
var mkSingleCmd = function(sigs, cmd) {
  enforceArray(sigs, "sigs");
  enforceType(cmd, "string", "cmd");
  return {
    hash: pullAndCheckHashs(sigs),
    sigs: sigs.map(pullSig),
    cmd: cmd
  };
};

/**
 * Makes outer wrapper for a 'send' endpoint.
 * @param {array or object} cmds - one or an array of commands, see mkSingleCmd
 */
var mkPublicSend = function(cmds) {
  return { cmds: asArray(cmds) };
};

/**
 * Make an ED25519 "signer" array element for inclusion in a Pact payload.
 * @param {object} kp - a ED25519 keypair
 * @return {object} an object with pubKey, addr and scheme fields.
 */
var mkSigner = function(kp) {
  return {
    pubKey: kp.publicKey,
    addr: kp.publicKey,
    scheme: "ED25519"
  };
};

var asArray = function(singleOrArray) {
  if (Array.isArray(singleOrArray)) {
    return singleOrArray;
  } else {
    return [singleOrArray];
  }
};

var enforceType = function(val, type, msg) {
  if (typeof val !== type) {
    throw new TypeError(
      msg + " must be a " + type + ": " + JSON.stringify(val)
    );
  }
};

var enforceArray = function(val, msg) {
  if (!Array.isArray(val)) {
    throw new TypeError(msg + " must be an array: " + JSON.stringify(val));
  }
};

/**
 * Make a full 'send' endpoint exec command. See 'prepareExecCmd' for parameters.
 */
var simpleExecCommand = function(keyPairs, nonce, pactCode, envData, meta) {
  return mkPublicSend(prepareExecCmd(keyPairs, nonce, pactCode, envData, meta));
};

var unique = function(arr) {
  var n = {},
    r = [];
  for (var i = 0; i < arr.length; i++) {
    if (!n[arr[i]]) {
      n[arr[i]] = true;
      r.push(arr[i]);
    }
  }
  return r;
};

/**
 * Given an exec 'send' message, prepare a message for 'poll' endpoint.
 * @param execMsg {object} JSON with "cmds" field, see 'mkPublicSend'
 * @return {object} with "requestKeys" for polling.
 */
var simplePollRequestFromExec = function(execMsg) {
  var cmds =
    execMsg.cmds ||
    TypeError("expected key 'cmds' in object: " + JSON.stringify(execMsg));
  var rks = [];
  if (
    !cmds.every(function(v) {
      return v.hasOwnProperty("hash");
    })
  ) {
    throw new TypeError(
      'maleformed object, expected "hash" key in every cmd: ' +
        JSON.stringify(execMsg)
    );
  } else {
    rks = unique(
      cmds.map(function(v) {
        return v.hash;
      })
    );
  }
  return { requestKeys: rks };
};

/**
 * Given an exec 'send' message, prepare a message for 'listen' endpoint.
 * @param execMsg {object} JSON with "cmds" field, see 'mkPublicSend'. Only takes first element.
 * @return {object} with "requestKey" for polling.
 */
var simpleListenRequestFromExec = function(execMsg) {
  var cmds =
    execMsg.cmds ||
    TypeError("expected key 'cmds' in object: " + JSON.stringify(execMsg));
  var rks = [];
  if (
    !cmds.every(function(v) {
      return v.hasOwnProperty("hash");
    })
  ) {
    throw new TypeError(
      'maleformed object, expected "hash" key in every cmd: ' +
        JSON.stringify(execMsg)
    );
  } else {
    rks = unique(
      cmds.map(function(v) {
        return v.hash;
      })
    );
  }
  return { listen: rks[0] };
};

/**
 * Variadic function to form a lisp s-expression application.
 * Encases arguments in parens and intercalates with a space.
 */
var mkExp = function(pgmName) {
  enforceType(pgmName, "string", "pgmName");
  return (
    "(" +
    pgmName +
    " " +
    Array.prototype.slice
      .call(arguments, 1)
      .map(JSON.stringify)
      .join(" ") +
    ")"
  );
};

/**
 * Prepare a chainweb-style meta payload.
 * @param sender {string} gas account
 * @param chainId {string} chain identifier
 * @param gasPrice {number} desired gas price
 * @param gasLimit {number} desired gas limit
 * @return {object} of arguments, type-checked and properly named.
 */
var mkMeta = function(sender, chainId, gasPrice, gasLimit) {
  enforceType(sender, "string", "sender");
  enforceType(chainId, "string", "chainId");
  enforceType(gasPrice, "number", "gasPrice");
  enforceType(gasPrice, "number", "gasLimit");
  return {
    gasLimit: gasLimit,
    chainId: chainId,
    gasPrice: gasPrice,
    sender: sender
  };
};

/**
 * Formats ExecCmd into api request object
 */
var mkReq = function(cmd) {
  return {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(cmd)
  };
};

/**
 * A Command Object to Execute in Pact Server.
 * @typedef {Object} execCmd
 * @property pactCode {string} pact code to execute
 * @property keyPairs {array or object} array or single ED25519 keypair
 * @property nonce {string} nonce value, default at current time
 * @property envData {object} JSON message data for command, default at empty obj
 * @property meta {object} meta information, see mkMeta
 */

/**
 * Sends Pact command to a running Pact server and retrieves tx result.
 * @param {[execCmd] or execCmd} sendCmd cmd or a list of cmd's to execute
 * @param {string} apiHost host running Pact server
 * @return {object} Request key of the tx received from pact server.
 */
const fetchSend = async function(sendCmd, apiHost){
  if (!apiHost)  throw new Error(`Pact.fetch.send(): No apiHost provided`);
  const sendCmds = asArray(sendCmd).map(cmd => prepareExecCmd(cmd.keyPairs, cmd.nonce, cmd.pactCode, cmd.envData, cmd.meta));
  const txRes = await fetch(`${apiHost}/api/v1/send`, mkReq(mkPublicSend(sendCmds)));
  const tx = await txRes.json();
  return tx;
};

/**
 * Sends Local Pact command to a local Pact server and retrieves local tx result.
 * @param {execCmd} localCmd a single cmd to execute locally
 * @param {string} apiHost host running Pact server
 * @return {object} tx result received from pact server.
 */
const fetchLocal = async function(localCmd, apiHost) {
  if (!apiHost)  throw new Error(`Pact.fetch.local(): No apiHost provided`);
  const {keyPairs, nonce, pactCode, envData, meta} = localCmd
  const cmd = prepareExecCmd(keyPairs, nonce, pactCode, envData, meta);
  const txRes = await fetch(`${apiHost}/api/v1/local`, mkReq(cmd));
  const tx = await txRes.json();
  return tx.result;
};

/**
 * Request poll Pact command to a running Pact server and retrieves tx result.
 * @param {{requestKeys: [<rk:string>]}} pollCmd request Keys of txs to poll.
 * @param {string} apiHost host running Pact server
 * @return {object} Array of tx request keys and tx results from pact server.
 */
const fetchPoll = async function(pollCmd, apiHost) {
  if (!apiHost)  throw new Error(`Pact.fetch.poll(): No apiHost provided`);
  const res = await fetch(`${apiHost}/api/v1/poll`, mkReq(pollCmd));
  const resJSON = await res.json();
  return Object.values(resJSON).map(res => {
    return { reqKey: res.reqKey, result: res.result };
  });
};

/**
 * Request listen Pact command to a running Pact server and retrieves tx result.
 * @param {{listenCmd: <rk:string>}} listenCmd reqest key of tx to listen.
 * @param {string} apiHost host running Pact server
 * @return {object} Object containing tx result from pact server
 */
const fetchListen = async function(listenCmd, apiHost) {
  if (!apiHost)  throw new Error(`Pact.fetch.listen(): No apiHost provided`);
  const res = await fetch(`${apiHost}/api/v1/listen`, mkReq(listenCmd));
  const resJSON = await res.json();
  return resJSON.result;
};

module.exports = {
  crypto: {
    binToHex: binToHex,
    hexToBin: hexToBin,
    base64UrlEncode: base64UrlEncode,
    hash: hash,
    genKeyPair: genKeyPair,
    sign: sign,
    toTweetNaclSecretKey: toTweetNaclSecretKey
  },
  api: {
    prepareExecCmd: prepareExecCmd,
    mkSingleCmd: mkSingleCmd,
    mkPublicSend: mkPublicSend
  },
  lang: {
    mkExp: mkExp,
    mkMeta: mkMeta
  },
  simple: {
    exec: {
      createCommand: simpleExecCommand,
      createLocalCommand: prepareExecCmd,
      createPollRequest: simplePollRequestFromExec,
      createListenRequest: simpleListenRequestFromExec
    }
  },
  fetch: {
    send: fetchSend,
    local: fetchLocal,
    poll: fetchPoll,
    listen: fetchListen
  }
};
