# Pact Smart Contract Language TodoMVC demo
### (using Vue.js for the front end)

## Running the demo

```
# Install pact (see github.com/kadena-io/pact for help)
brew install pact

# Install npm's deps
npm install

# Launch pact's server
pact --serve 8080

# (in another terminal) load the pact/todos.pact smart contract
./initialize-todos.sh 8080

# open localhost:8080 in your browser
```

## Details

To keep the pact<->vue interactions clear, we made them fully synchronous instead of using vue to hold the main application's state.
Simply, for every change one makes to the todo list (besides filtering) that change is propagated back to pact and the application's full state is then reread via the `(todos.read-all)` command.

## Credit

This original Vue.js TodoMVC application was created by [Evan You](http://evanyou.me).
