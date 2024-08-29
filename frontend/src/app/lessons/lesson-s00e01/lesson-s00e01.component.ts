import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-lesson-s00e01',
    templateUrl: './lesson-s00e01.component.html',
    styleUrls: ['./lesson-s00e01.component.scss']
})
export class LessonS00E01Component implements OnInit {

    constructor(private http: HttpClient) { }

    ngOnInit() {
    }

    processLesson() {
        const payload = {};

        console.log("Sending request to backend with payload:", payload);

        this.http.post(`${environment.apiUrl}/lessons/s0e01`, payload)
            .subscribe({
                next: (response) => {
                    console.log("Response from backend:", response);
                },
                error: (error) => {
                    console.error("Error from backend:", error);
                }
            });
    }
}
