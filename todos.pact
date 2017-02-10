;; todos module, admin keyset, and table
(define-keyset 'todo-admin-keyset (read-keyset "todo-admin-keyset"))

(module todos 'todo-admin-keyset
  (defconst ACTIVE "active")
  (defconst COMPLETED "completed")
  (defconst DELETED "deleted")
  (defschema todo
    "Row type for todos."
     id:integer
     deleted:bool
     state:string
     entry:string
     )

  (deftable todo-table:{todo})

  (defconst NEXT-UUID "next-uuid")
  (defschema uuid
    "create and track uuids for todos"
    uuid:integer
    )
  (deftable uuid-tracker:{uuid})

  (defun new-todo (entry)
    (with-read uuid-tracker NEXT-UUID {"uuid":= id}
      (update uuid-tracker NEXT-UUID {"uuid": (+ id 1)})
      (insert todo-table (format "{}" id) {"id":id, "deleted":false, "state": ACTIVE, "entry": entry})
      {"id": id, "status":ACTIVE, "entry":entry}
    )
  )

  (defun toggle-todo-status (id:integer)
    (let ((idStr (format "{}" id)))
      (check-deleted idStr)
      (with-read todo-table idStr {"state":= state}
        (update todo-table idStr {"state": (if (= state ACTIVE) COMPLETED ACTIVE)})
      )
    )
  )

  (defun not-deleted (obj:object{todo})
    (bind obj {"deleted":=deleted}
      (not deleted)
    )
  )

  (defun check-deleted (id:string)
    (enforce (not-deleted (read todo-table id)) "todo has been deleted")
  )

  (defun edit-todo (id:integer entry)
    (let ((idStr (format "{}" id)))
      (check-deleted idStr)
      (update todo-table idStr {"entry": entry})
    )
  )

  (defun delete-todo (id:integer)
    (let ((id-key (format "{}" id)))
      (update todo-table id-key {"deleted": true})
    )
  )

  (defun read-todo (id:integer)
    (read todo-table (format "{}" id))
  )

  (defun read-todos:[object{todo}] ()
    (filter (not-deleted) (map (read todo-table) (keys todo-table)))
  )

)

(create-table todo-table)
(create-table uuid-tracker)
(insert uuid-tracker NEXT-UUID {"uuid": 0})
;done
