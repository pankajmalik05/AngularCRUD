import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { HttpModule } from "@angular/http";

import { AppComponent } from "./app.component";
import { HeaderComponent } from "./shared/header/header.component";
import { RegistrationComponent } from "./registration/registration.component";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";
import { EditorTodoComponent } from "./todo/editor-todo.component";
import { TodoComponent } from "./todo/todo.component";
import { TodoListComponent } from "./todo/todo-list.component";

import { UserService } from "./shared/services/user.service";
import { AuthService } from "./shared/services/auth.service";
import { JwtService } from "./shared/services/jwt.service";
import { TodoService } from "./shared/services/todo.service";
import { RoleService } from "./shared/services/role.service";

import { AppConfig } from "./shared/appConfig";

import { ShowAuthedDirective } from "./shared/directive/auth.directive";
import { UsersComponent } from "./users/users.component";
import { UsersEditComponent } from "./users/users-edit.component";

const appRoutes: Routes = [
  { path: "", component: HomeComponent },
  { path: "register", component: RegistrationComponent },
  { path: "login", component: LoginComponent },
  { path: "create_todo", component: EditorTodoComponent },
  { path: "edit_todo/:id", component: EditorTodoComponent },
  { path: "users", component: UsersComponent },
  { path: "user/add", component: UsersEditComponent },
  { path: "users/:id", component: UsersEditComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ShowAuthedDirective,
    RegistrationComponent,
    HomeComponent,
    LoginComponent,
    EditorTodoComponent,
    TodoComponent,
    TodoListComponent,
    UsersComponent,
    UsersEditComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    UserService,
    AuthService,
    JwtService,
    TodoService,
    RoleService,
    AppConfig,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
