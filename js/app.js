/*global Vue, todoStorage, Pact */

(function (exports) {

  'use strict';

  var filters = {
    all: function (todos) {
      return todos;
    },
    active: function (todos) {
      return todos.filter(function (todo) {
        return !todo.completed;
      });
    },
    completed: function (todos) {
      return todos.filter(function (todo) {
        return todo.completed;
      });
    }
  };

  exports.app = new Vue({

    // the root element that will be compiled
    el: '.todoapp',

    // app initial state
    data: {
      todos: [],
      newTodo: '',
      editedTodo: null,
      visibility: 'all',
      keyPair: Pact.crypto.genKeyPair(),
      enableDebug: false
    },

    // computed properties
    // http://vuejs.org/guide/computed.html
    computed: {
      filteredTodos: function () {
        return filters[this.visibility](this.todos);
      },
      remaining: function () {
        return filters.active(this.todos).length;
      },
      allDone: {
        get: function () {
          return this.remaining === 0;
        },
        set: function (value) {
          this.todos.forEach(function (todo) {
            todo.completed = value;
          });
        }
      }
    },

    // methods that implement data logic.
    // note there's no DOM manipulation here at all.
    methods: {

      convertEntry: function(t) {
        return {
          "id": t.id,
          "completed": (t.state === "completed"),
          "title": t.entry};
        },

      pluralize: function (word, count) {
        return word + (count === 1 ? '' : 's');
      },

      debug: function(s) {
        if (this.enableDebug) {
          console.log(s);
          return;
        } else {
          return;
        }
      },
      sendPactCmdSync: function(cmd, f) {
        var msg = Pact.simple.exec.createCommand(this.keyPair, Date.now().toString(), cmd);
        this.debug(msg);
        this.$http.post('/api/v1/send', msg).then(function(resp) {
          if (resp.body.status === "success") {
            var getResMsg = {"listen": resp.body.response.requestKeys[0]};
            this.debug(getResMsg);
            this.$http.post('/api/v1/listen', getResMsg).then(function(rkResp) {
              if (rkResp.body.status === "success") {
                this.debug(rkResp.body);
                if (f) {f(rkResp.body);}
              } else {
                console.log(rkResp.body);
              }
            });
          } else {
            console.log(resp.body);
          }
        });
      },

      // we're keeping this todomvc simple and having the app update its todos fully every time
      updateTodos: function(resp) {
        var allTodos = resp.response.result.data.map(this.convertEntry).sort(function(a,b){
          if (a.id < b.id) {
            return -1;
          } else if (a.id > b.id) {
            return 1;
          } else {
            return 0;
          }
        });
        this.todos = allTodos;
      },

      getAllTodos: function() {
        var pactCmd = '(todos.read-todos)';
        this.sendPactCmdSync(pactCmd, this.updateTodos);
      },

      addTodo: function () {
        var value = this.newTodo && this.newTodo.trim();
        if (!value) {
          return;
        }
        this.newTodo = '';
        //ex: (todos.new-todo 1)
        var pactCmd = '(todos.new-todo ' + JSON.stringify(value) + ')';
        this.sendPactCmdSync(pactCmd);
        this.getAllTodos();
      },

      removeTodo: function (todo) {
        var id = todo.id;
        //ex: (todos.delete-todo 1)
        var pactCmd = '(todos.delete-todo ' + JSON.stringify(id) + ')';
        this.sendPactCmdSync(pactCmd);
        this.getAllTodos();
      },

      editTodo: function (todo) {
        this.beforeEditCache = todo.title;
        this.editedTodo = todo;
      },

      doneEdit: function (todo) {
        if (!this.editedTodo) {
          return;
        }
        this.editedTodo = null;
        todo.title = todo.title.trim();
        if (!todo.title) {
          this.removeTodo(todo);
        } else {
          var id = todo.id;
          //ex: (todos.edit-todo 1 "foo")
          var pactCmd = '(todos.edit-todo ' + JSON.stringify(id) + ' ' + JSON.stringify(todo.title) + ')';
          this.sendPactCmdSync(pactCmd);
          this.getAllTodos();
        }
      },

      cancelEdit: function (todo) {
        this.editedTodo = null;
        todo.title = this.beforeEditCache;
      },

      removeCompleted: function () {
        // for this, we're batching multiple (delete) commands into a single transaction
        // ex: (todos.delete-todo 1)\n(todos.delete-todo 2)
        var pactCmd = filters.completed(this.todos).map(function(todo){
          return '(todos.delete-todo ' + JSON.stringify(todo.id) + ')';
        }).join("\n");
        this.sendPactCmdSync(pactCmd);
        this.getAllTodos();
      }
    },

    // a custom directive to wait for the DOM to be updated
    // before focusing on the input field.
    // http://vuejs.org/guide/custom-directive.html
    directives: {
      'todo-focus': function (el, binding) {
        if (binding.value) {
          el.focus();
        }
      }
    },
    mounted: function () {
      this.getAllTodos();
    }
});

})(window);
