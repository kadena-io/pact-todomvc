# Pact Smart Contract Language API JavaScript wrappers

This package is here to help make interaction with both Pact's development server & a ScalableBFT cluster running Pact easy.
The API's for each are the same. For information about Pact & ScalableBFT please see [kadena.io](kadena.io) or [github.com/kadena-io/pact](github.com/kadena-io/pact).

For example usage, see [github.com/kadena-io/pact-todomvc](github.com/kadena-io/pact-todomvc)

## Import

`pact-lang-api.js` should work as expected as a regular node dependency.

`<script src="pact-lang-api-global.min.js"></script>` will import the library and inject it as a top-level definition called `Pact`

## Functions

### Crypto

Converting between binary & hex formats:

```
Pact.crypto.binToHex(<Uint8Array>) -> string
Pact.crypto.hexToBin(string) -> Uint8Array
```

Hashing (blake2b):

```
Pact.crypto.hash(string) -> string
```

PPK Signing is done via TweetNacl but with ed25519-donna style keys, represented as hex.
blake2b is used to hash the message (<string>), and TweetNacl then signs the hash.

```
Pact.crypto.genKeyPair() -> {"publicKey": <string>, "secretKey": <string>}
Pact.crypto.sign(<string>, keyPair) -> {"hash": <string>, "sig":<string>, "pubKey":<string>}
Pact.crypto.toTweetNaclSecretKey(keyPair) -> <Uint8Array>
```

### Language Expression Construction

A helper function for constructing native Pact commands.

```
Pact.lang.mkExp(<string>, *args) -> <string>
  ex: mkExp("todos.edit-todo", 1, "bar") -> '(todos.edit-todo 1 "bar")'

Pact.lang.mkMeta(<sender:string> , <chainId:string>, <gasPrice: nunmber>, <gasLimit: number>) -> <meta: object>
  ex: mkMeta("Bob", "Chain-1", 20, 30) -> { "sender": "Bob", "ChainId": "Chain-1", "gasPrice": 20, "gasLimit": 30 }
```

NB: `JSON.stringify`, which is used here, generally converts floating point numbers correctly but fails for high precision scientific numbers < 0; you will need to manually convert them.
e.g. `JSON.stringify(.0000001) -> '1e-7'` is incorrect as Pact has infinite precision decimals but does not interpret scientific numbers, so the proper conversion would be `JSON.stringify(.0000001) -> '0.0000001'`



### Simple API Fetch

Simple fetch functions to make API request to a running Pact Server and retrieve the results.

```
* A Command Object to Execute in send or local.
* @typedef {Object} execCmd
* @property pactCode {string} - pact code to execute
* @property keyPairs {array or object} - array or single ED25519 keypair
* @property nonce {string} - nonce value, default at current time
* @property envData {object} - JSON message data for command, default at empty obj
* @property meta {object} - meta information, see mkMeta
*/
```
```
## Make API request to execute a command or commands in the public server and retrieve request keys of the txs.

Pact.fetch.send([<execCmd:object>], <apiHost:string>) -> {"requestKeys": [...]}

  ex:
    const cmds = [{
                    keyPairs: KEY_PAIR,
                    pactCode: 'todos.delete-todos "id-1"'
                  },{
                    keyPairs: KEY_PAIR,
                    pactCode: 'todos.delete-todos "id-2"'
                  },{
                    keyPairs: KEY_PAIR,
                    pactCode: 'todos.delete-todos "id-3"'
                  }]

    Pact.fetch.send(cmds, API_HOST)

    //Returns the following as a Promise Value
    { requestKeys: [ "6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE",
                     "P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0",
                     "qqhiEAuerIBrkZArSXPZxybQLzkTzHcwiB4ZrRU7FJM" ]}
```
```
## Make API request to execute a single command in the local server and retrieve the result of the tx. (Used to execute commands that read DB)
Pact.fetch.local(<execCmd:object>, <apiHost:string>) -> {result}

  ex:     
    const cmd = {
        keyPairs: KEY_PAIR,
        pactCode: `(todos.read-todos)`
      };

    Pact.fetch.local(cmd, API_HOST)

    //Returns the following as a Promise Value
    { status: "success",
       data: [{ id: "id-1"
                title: "wash"
                completed: false
              }]
    }
```
```
## Make API request to retrieve result of a tx or multiple tx's with request keys.
Pact.fetch.poll({requestKeys: ["..."]}, <apiHost:string>) -> [{requestKey: "...", result: {...}}, ...]

  ex:
    const cmd = { requestKeys: [ "6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE",
                                 "P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0" ]}

    Pact.fetch.poll(cmd, API_HOST)

    //Returns the following as a Promise Value
    [{ reqKey: "6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE",
       result: {
         status: "success",
         data: "Write succeeded"
       }
     },
     { reqKey: "P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0",
       result: {
         status: "success",
         data: "Write succeeded"
       }
     }]
```
```
## Make API request to retrieve result of a tx with a request key.
Pact.fetch.listen({listen: "..."}, <apiHost:string>) -> {status: "...", data: "..."}

  ex:
    const cmd = { listen: "6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE" }

    Pact.fetch.listen(cmd, API_HOST)

    //Returns the following as a Promise Value
    { status: "success",
      data: "Write succeeded" }
```


### Simple API Command

A simplified set of functions for working with the api.

```
## Creates a command to send as POST to /api/send
Pact.simple.exec.createCommand([keyPair], <nonce: string>, <pactCode: string>, <envData: object>) -> {"cmds":[...]}

## Creates a command to send as POST to /api/local
Pact.simple.exec.createLocalRequest([keyPair], <nonce: string>, <pactCode: string>, <envData: object>) -> {"hash": "...", sigs: [...], cmd: {...} }

## Creates a command to send as POST to /api/poll
Pact.simple.exec.createPollRequest({"cmds": [...]}) -> {"requestKeys": [...]}

## Creates a command to send as POST to /api/listen
Pact.simple.exec.createListenRequest({"cmds": [...]}) -> {"listen": <string>}
```

### Low Level API

Lower level/internal functions to aid in the construction of JSON blobs that the API endpoints expect.
You probably want to use the `Pact.simple` functions instead of these.

```
Pact.api.mkSingleCmd([signatures],{cmd-object}) -> {"hash":<string>, "sigs":[signatures], "cmd":cmd}
Pact.api.mkPublicSend([cmd]) -> {"cmds":[cmd]} \\ send as POST to /api/poll
```
