import {
  Component,
  OnChanges,
  SimpleChanges,
  OnInit,
  Input,
} from "@angular/core";

import { Todo } from "../shared/models/todo.model";
import { TodoService } from "../shared/services/todo.service";
import { AuthService } from "app/shared/services/auth.service";

@Component({
  selector: "app-todo-list",
  templateUrl: "./todo-list.component.html",
  styleUrls: ["./todo-list.component.scss"],
})
export class TodoListComponent implements OnChanges, OnInit {
  todos: Todo[];
  @Input() id: number;
  message: string;
  role: string;
  username: string;
  permissions: string[];

  constructor(
    private todoService: TodoService,
    private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges) {}

  ngOnInit() {
    this.permissions = this.authService.getCurrentUserPermissions();
    this.role = this.authService.getCurrentUserRole();
    this.username = this.authService.getCurrentUserUsername();
    this.todoService.getTodos().subscribe((data) => {
      data = data.map((todo) => {
        return {
          ...todo,
          role: this.role,
        };
      });
      console.log(data);

      if (data === "Todos are not created" && this.todos === undefined) {
        this.message = data;
      } else if (data === "Todos are not created" && this.todos !== undefined) {
        this.todos.splice(0, this.todos.length);
        this.message = data;
      } else {
        this.todos = data;
        this.message = "";
      }

      if (data === "Todo removed" && this.todos.length === 0) {
        this.message = data;
      }
    });
  }

  onChanged(index: number) {
    this.todos.splice(index, 1);
    this.message = "Todo was removed";
    setTimeout(() => {
      this.message = "";
    }, 1000);
    if (this.todos.length === 0) {
      this.message = "Todos are not created";
    }
  }

  onChangedExecute(index: number) {
    this.todos.splice(index, 1);
    this.message = "Todo was done";
    setTimeout(() => {
      this.message = "";
    }, 1000);
    if (this.todos.length === 0) {
      this.message = "Todos are not created";
    }
  }
}
