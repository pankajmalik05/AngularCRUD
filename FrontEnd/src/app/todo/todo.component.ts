import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Todo } from "../shared/models/todo.model";
import { TodoService } from "../shared/services/todo.service";
import { AuthService } from "app/shared/services/auth.service";

@Component({
  selector: "app-todo",
  templateUrl: "./todo.component.html",
  styleUrls: ["./todo.component.scss"],
})
export class TodoComponent {
  @Input() todo: Todo;
  @Input() index: number;
  @Output() onChanged = new EventEmitter<number>();
  @Output() onChangedExecute = new EventEmitter<number>();
  permissions: string[];

  constructor(
    private todoService: TodoService,
    private authService: AuthService
  ) {}

  remove(index: number, id: number) {
    if (this.authService.getCurrentUserRole() !== "admin") return;
    this.onChanged.emit(index);
    this.todoService.removeTodo(id).subscribe();
  }

  remove_execute(index: number, id: number) {
    if (this.authService.getCurrentUserRole() !== "admin") return;
    this.onChangedExecute.emit(index);
    this.todoService.removeTodo(id).subscribe();
  }

  updateToDO(index: number, id: number) {
    if (this.authService.getCurrentUserRole() !== "admin") return;
    console.log(this.todo);
    this.todo = {
      ...this.todo,
      checked: !this.todo.checked,
    };
    this.todoService.save(this.todo).subscribe();
  }

  ngOnInit() {
    this.permissions = this.authService.getCurrentUserPermissions();
  }
}
