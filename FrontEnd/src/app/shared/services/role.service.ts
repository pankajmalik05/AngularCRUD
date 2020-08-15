import { Injectable } from "@angular/core";
import { Http, Response, Headers } from "@angular/http";
import "rxjs/add/operator/map";

import { AppConfig } from "../appConfig";
import { User } from "../models/user.model";
import { JwtService } from "../services/jwt.service";

@Injectable()
export class RoleService {
  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private jwtService: JwtService
  ) {}

  create(role) {
    const headers = new Headers();
    headers.append("Authorization", "Token " + this.jwtService.getToken());

    return this.http
      .post(this.appConfig.urlServer + "/roles", role, { headers: headers })
      .map((res: Response) => res.json());
  }

  getAllRoles() {
    const headers = new Headers();
    headers.append("Authorization", "Token " + this.jwtService.getToken());

    return this.http
      .get(this.appConfig.urlServer + "/roles", { headers: headers })
      .map((res: Response) => res.json());
  }

  DeleteRole(id) {
    const headers = new Headers();
    headers.append("Authorization", "Token " + this.jwtService.getToken());

    return this.http
      .delete(this.appConfig.urlServer + "/roles/" + id, { headers: headers })
      .map((res: Response) => res.json());
  }
}
