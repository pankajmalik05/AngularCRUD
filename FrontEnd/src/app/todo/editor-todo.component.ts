import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, Validators, FormControl } from "@angular/forms";

import { Todo } from "../shared/models/todo.model";
import { TodoService } from "../shared/services/todo.service";
import { AuthService } from "app/shared/services/auth.service";

@Component({
  selector: "app-create-todo",
  templateUrl: "./editor-todo.component.html",
  styleUrls: ["./editor-todo.component.scss"],
})
export class EditorTodoComponent implements OnInit {
  todo: Todo[];
  editorForm: any;
  selected: string;
  action: string;
  message: string;
  url: string[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private todoService: TodoService
  ) {
    this.editorForm = formBuilder.group({
      name: ["", [<any>Validators.required]],
    });
  }

  ngOnInit() {
    if (!this.authService.getCurrentUserPermissions().includes("read_todos"))
      this.router.navigateByUrl("/");
    this.url = this.router.url.split("/");

    if (this.url.length === 2) {
      this.action = "Create";
    } else {
      this.action = "Edit";

      this.route.params.subscribe((params) => {
        const id = +params["id"];

        this.todoService.getTodo(id).subscribe((data) => {
          this.todo = data;
          this.todo[0].todo_id = data[0].todo_id;

          (<FormControl>this.editorForm.controls["name"]).patchValue(
            data[0].name,
            { onlySelf: true }
          );
        });
      });
    }
  }

  save(todo: Todo) {
    this.message = "";

    if (this.todo !== undefined) {
      todo.todo_id = this.todo[0].todo_id;
    }

    this.todoService.save(todo).subscribe(
      (data) => {
        this.message = data;
        setTimeout(() => {
          this.router.navigateByUrl("/");
        }, 2000);
      },
      (err) => {
        this.message = "Todo already was created";
      }
    );
  }
}
