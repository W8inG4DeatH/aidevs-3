import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s04e04',
    templateUrl: './lesson-s04e04.component.html',
    styleUrls: ['./lesson-s04e04.component.scss'],
})
export class LessonS04E04Component implements OnInit {
    [key: string]: any;

    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'webhook';
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public mainAnswer: any = 'https://googles.com.pl/aidevs/';
    public reportResponse: any = '';
    public processStatus: string = '';

    public backendUrl = `${environment.apiUrl}/lessons/s04e04`;

    constructor(private http: HttpClient) { }

    ngOnInit() { }

    async processLesson() {
        try {
            this.processStatus = 'Rozpoczynanie procesu lekcji...';
            console.log(this.processStatus);

            // Krok 1: Wysłanie mainAnswer do centrali
            await this.sendJsonToHeadquarters();
        } catch (error) {
            this.processStatus = 'Błąd podczas procesu lekcji.';
            console.error(this.processStatus, error);
        }
    }

    async sendJsonToHeadquarters() {
        try {
            this.processStatus = 'Wysyłanie odpowiedzi do centrali...';
            console.log(this.processStatus);

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: this.mainAnswer,
            };

            const reportUrl = 'https://centrala.ag3nts.org/report';

            this.reportResponse = await this.http.post(reportUrl, reportPayload).toPromise();
            this.processStatus = 'Odpowiedź została wysłana do centrali.';
            console.log(this.processStatus);
            console.log('Odpowiedź centrali:', this.reportResponse);
        } catch (error) {
            this.processStatus = 'Nie udało się wysłać danych do centrali.';
            console.error(this.processStatus, error);
        }
    }
}
