;;
;; todos smart contract
;;

;; admin keyset definition
(define-keyset 'todo-admin-keyset
  (read-keyset "todo-admin-keyset"))

;; todos module, administered by keyset
(module todos 'todo-admin-keyset
  " Smart contract module for TODO-MVC pact app.   \
  \ Tables:                                        \
  \ todo -- holds todo entries"

  ;; todo schema and table
  (defschema todo
    "Row type for todos."
     title:string
     completed:bool
     deleted:bool )

  (deftable todo-table:{todo})

  ;;
  ;; API functions
  ;;

  (defun new-todo (id title)
    "Create new todo with ENTRY and DATE."
    (insert todo-table id {
      "title": title,
      "completed": false,
      "deleted": false })
  )

  (defun toggle-todo-status (id:string)
    "Toggle completed status flag for todo at ID."
    (with-read todo-table id {
      "completed":= state
      }
      (update todo-table id {
        "completed": (not state) })))

  (defun edit-todo (id:string title)
    "Update todo ENTRY at ID."
    (update todo-table id {
      "title": title }))

  (defun delete-todo (id:string)
    "Delete todo title at ID (by setting deleted flag)."
    (update todo-table id {
      "deleted": true }))

  (defun read-todo:object (id:string)
    "Read a single todo"
    (+ {'id: id} (read todo-table id)))

  (defun read-todos:[object{todo}] ()
    "Read all todos."
    (map (read-todo) (keys todo-table)))
)

(create-table todo-table)
;done
