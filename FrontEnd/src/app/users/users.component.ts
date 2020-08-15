import { Component, OnInit } from "@angular/core";
import { UserService } from "app/shared/services/user.service";
import { AuthService } from "app/shared/services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  users = [];
  permissions: string[];
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.permissions = this.authService.getCurrentUserPermissions();
    this.userService.getAllUsers().subscribe((data) => (this.users = data));
  }

  remove(id) {
    if (id === this.authService.getCurrentUser().user_id) {
      alert("You Cannot Remove Your self");
      return;
    }
    var r = confirm("Are You Sure Want to Delete!");
    if (r == true) {
      this.userService.DeleteUser(id).subscribe((data) => {
        this.users = this.users.filter((user) => user.user_id !== id);
        alert(data);
      });
    }
  }

  edit(id) {
    this.router.navigate(["/users/" + id]);
  }
}
