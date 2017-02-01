;; todos module, admin keyset, and table

(use 'keysets)

(define-keyset 'todo-admin-keyset
  (read-keyset "todo-admin-keyset"))

(module todos 'todo-admin-keyset
  (defconst ACTIVE "active")
  (defconst COMPLETED "completed")
  (defschema todo
    "Row type for todos."
     id:integer
     state:string
     entry:string
     data
     )
  (deftable todos:{todo}
     "Main table for todos module.")

  (defconst LAST-UUID "last-uuid")
  (defschema uuid
    "create and track uuids for todos"
    uuid:integer
    )
  (deftable uuid-tracker:{uuid})

  (defun new-uuid ()
    (with-read uuid-tracker LAST-UUID {"uuid":=last-uuid}
      (update uuid-tracker LAST-UUID {"uuid": (+ last-uuid 1)})
    ))

  (defun new-todo (entry)
    (let ((uuid (new-uuid)))
      (insert todos uuid {"id":uuid
                         ,"state": ACTIVE
                         ,"entry": entry})
      {"id": uuid, "status":ACTIVE, "entry":entry}
    )
  )

  (defun toggle-todo-status (id)
    (with-read todos id {"state":=state}
      (update todos id {"state":=(if (= state ACTIVE) COMPLETED ACTIVE)})
    )
  )

  (defun edit-todo (id entry)
    (update todos id {"entry":=entry})
  )

  (defun delete-todo (id)
    (delete todos id)
  )

  (defun read-todo (id)
    (read todos id)
  )

  (defun read-all ()
    (map (read-todo) (keys todos))
  )

)

(create-table todos)
(create-table uuids)
(insert uuids LAST-UUID {"uuid":0})
;done
