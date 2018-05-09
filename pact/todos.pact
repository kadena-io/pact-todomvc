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
  \ todo -- holds todo entries                     \
  \ uuid -- uuid creation tracking singleton table "

  ;; todo schema and table
  (defschema todo
    "Row type for todos."
     id:integer
     deleted:bool
     state:string
     entry:string
     )

  (deftable todo-table:{todo})

  ;; uuid schema and singleton table
  (defschema uuid
    "create and track uuids for todos"
    uuid:integer
    )

  (deftable uuid-tracker:{uuid})


  ;; todo state consts
  (defconst ACTIVE "active")
  (defconst COMPLETED "completed")
  (defconst DELETED "deleted")

  ;; key for uuid singleton table
  (defconst NEXT-UUID "next-uuid")

  ;;
  ;; API functions
  ;;

  (defun new-todo (entry)
    "Create new todo with ENTRY."
    (with-read uuid-tracker NEXT-UUID
      { "uuid" := id }
      (update uuid-tracker NEXT-UUID
        { "uuid": (+ id 1) })
      (insert todo-table (id-key id)
        { "id": id,
          "deleted": false,
          "state": ACTIVE,
          "entry": entry
        })
      ;; return json of stored values
      {"id": id, "status":ACTIVE, "entry":entry}
    )
  )

  (defun toggle-todo-status (id:integer)
    "Toggle ACTIVE/COMPLETED status flag for todo at ID."
    (let ((key (enforce-not-deleted id)))
      (with-read todo-table key
        { "state" := state }
        (update todo-table key
          { "state":
              (if (= state ACTIVE) COMPLETED ACTIVE)
          })
      )
    )
  )

  (defun edit-todo (id:integer entry)
    "Update todo ENTRY at ID."
    (let ((key (enforce-not-deleted id)))
      (update todo-table key
        { "entry": entry })
    )
  )

  (defun delete-todo (id:integer)
    "Delete todo entry at ID (by setting deleted flag)."
    (update todo-table (id-key id)
      { "deleted": true })
  )

  (defun read-todo (id:integer)
    "Read todo at ID."
    (read todo-table (id-key id))
  )

  (defun read-todos:[object{todo}] ()
    "Read all un-deleted todos."
    (filter (not-deleted)
      (map (read todo-table) (keys todo-table)))
  )


  ;;
  ;; Utility functions
  ;;

  (defun not-deleted (obj:object{todo})
    "Utility to check deleted flag of todo OBJ."
    (not (at "deleted" obj)))

  (defun enforce-not-deleted (id:integer)
    "Enforce row exists at ID and deleted flag is not set. \
    \ Also returns formatted row key."
    (let ((key (id-key id)))
      (enforce (not-deleted (read todo-table key))
        "todo must not be deleted")
      key))


  (defun id-key (id:integer)
    "Format ID integer value as todo row key."
    (format "{}" [id])
  )


)

(create-table todo-table)
(create-table uuid-tracker)
(insert uuid-tracker NEXT-UUID {"uuid": 0})
;done
