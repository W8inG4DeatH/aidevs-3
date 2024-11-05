import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { IAiFile } from 'src/app/common-components/common-components.interfaces';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PromptsDatabaseService {
    private apiUrl = `${environment.apiUrl}/databases/text_database`;

    private setPromptFromPromptDatabaseByNameKeySubject = new Subject<string>();
    setPromptFromPromptDatabaseByNameKey$ = this.setPromptFromPromptDatabaseByNameKeySubject.asObservable();
    private processCompleteSubject = new Subject<void>();
    processComplete$ = this.processCompleteSubject.asObservable();

    constructor(private http: HttpClient) { }

    readAllTxtFiles(directory: string): Observable<IAiFile[]> {
        return this.http.post<IAiFile[]>(`${this.apiUrl}/list`, { directory });
    }

    updateTxtFile(file: IAiFile, directory: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/update`, { ...file, directory });
    }

    deleteTxtFile(file: IAiFile, directory: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/delete`, { ...file, directory });
    }


    notifyProcessComplete() {
        this.processCompleteSubject.next();
    }

    setPromptFromPromptDatabaseByNameKey(setPromptFromPromptDatabaseByNameKey: string): Promise<void> {
        console.log('setPromptFromPromptDatabase:', setPromptFromPromptDatabaseByNameKey);
        return new Promise<void>((resolve, reject) => {
            this.processComplete$.subscribe({
                next: () => {
                    resolve();
                },
                error: (err) => {
                    reject(err);
                }
            });
            this.setPromptFromPromptDatabaseByNameKeySubject.next(setPromptFromPromptDatabaseByNameKey);
        });
    }
}
