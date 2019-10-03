import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: "root"
})
export class TrashCanService {

    constructor(private http : HttpClient) {

    }

    getTrashCans() {
        return this.http.get("https://twast-server.herokuapp.com/");
    }

}
