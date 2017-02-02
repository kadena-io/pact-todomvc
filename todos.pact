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
  (deftable todo-table:{todo})

  (defconst NEXT-UUID "next-uuid")
  (defschema uuid
    "create and track uuids for todos"
    uuid:integer
    )
  (deftable uuid-tracker:{uuid})

  (defun new-uuid ()
    (with-default-read uuid-tracker NEXT-UUID
      {"uuid": 0}
      {"uuid":= next-uuid}
      (update uuid-tracker NEXT-UUID {"uuid": (+ next-uuid 1)})
      next-uuid
    )
  )

  (defun new-todo (entry)
    (let ((id (new-uuid)))
      (insert todo-table (format "{}" id) {"id":id, "state": ACTIVE, "entry": entry})
      {"id": id, "status":ACTIVE, "entry":entry}
    )
  )

  (defun toggle-todo-status (id)
    (with-read todo-table id {"state":= state}
      (update todo-table id {"state": (if (= state ACTIVE) COMPLETED ACTIVE)})
    )
  )

  (defun edit-todo (id entry)
    (update todo-table id {"entry": entry})
  )

  (defun delete-todo (id:integer)
    (let ((id-key (format "{}" id)))
      (remove todo-table id-key)
    )
  )

  (defun read-todo (id)
    (read todo-table id)
  )

  (defun read-all ()
    (map (read-todo) (keys todo-table))
  )

)

(create-table todo-table)
(create-table uuid-tracker)
;done
