import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAiFile } from 'src/app/common-components/common-components.interfaces';

@Injectable({
    providedIn: 'root',
})
export class PromptsDatabaseService {
    private apiUrl = 'http://127.0.0.1:5000/api/databases/text_database';

    constructor(private http: HttpClient) {}

    readAllTxtFiles(directory: string): Observable<IAiFile[]> {
        return this.http.post<IAiFile[]>(`${this.apiUrl}/list`, { directory });
    }

    updateTxtFile(file: IAiFile, directory: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/update`, { ...file, directory });
    }

    deleteTxtFile(file: IAiFile, directory: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/delete`, { ...file, directory });
    }
}
