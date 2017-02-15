#!/bin/bash

if [ -z "$1" ];
then
  echo 'Server port must be supplied; ex: ./initialize-todos.sh 9001'
  exit 1
fi

# Public and private ed25519 keys
pubKey='06c9c56daa8a068e1f19f5578cdf1797b047252e1ef0eb4a1809aa3c2226f61e'
secKey='7ce4bae38fccfe33b6344b8c260bffa21df085cf033b3dc99b4781b550e1e922'

./load.js -cf pact/todos.pact -n hello -s $secKey -p $pubKey -d '{"todo-admin-keyset":{"keys":["06c9c56daa8a068e1f19f5578cdf1797b047252e1ef0eb4a1809aa3c2226f61e"],"pred":"="}}' | curl -X POST -d @- http://localhost:$1/api/v1/send
