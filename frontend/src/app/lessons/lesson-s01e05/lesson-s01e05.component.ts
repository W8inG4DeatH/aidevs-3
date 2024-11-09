import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s01e05',
    templateUrl: './lesson-s01e05.component.html',
    styleUrls: ['./lesson-s01e05.component.scss'],
})
export class LessonS01E05Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;

    public openAiPrompt: string = '';
    public downloadedFileContent: string = '';
    public processedFileContent: string = '';
    public reportResponse: any = null;
    public processStatus: string = '';
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'CENZURA';

    private backendUrl = `${environment.apiUrl}/lessons/s01e05`;

    constructor(private http: HttpClient) { }

    ngOnInit() { }

    async processLesson() {
        try {
            this.processStatus = 'Starting lesson process...';
            console.log(this.processStatus);

            // Krok 1: Pobranie pliku danych
            const fileUrl = `https://centrala.ag3nts.org/data/${this.apiKey}/cenzura.txt`;
            console.log('Downloading file from URL:', fileUrl);

            this.processStatus = 'Downloading data file...';

            // Użycie backendu jako proxy dla uniknięcia problemów CORS
            const downloadResponse: any = await this.http
                .get(`${this.backendUrl}/download-proxy-file`, { params: { apiKey: this.apiKey } })
                .toPromise();

            if (downloadResponse && downloadResponse.content) {
                this.downloadedFileContent = downloadResponse.content;
                console.log('Downloaded file content:', this.downloadedFileContent);
            } else {
                console.error('Failed to download file: response is invalid.');
                return;
            }

            // Krok 2: Przygotowanie prompta OpenAI
            this.processStatus = 'Processing data with OpenAI...';

            this.openAiPrompt = `W poniższym tekście zamień wszelkie dane wrażliwe (imię i nazwisko, nazwę ulicy i numer, miasto, wiek osoby) na słowo CENZURA. Zadbaj o każdą kropkę, przecinek, spację itp. Nie wolno Ci przeredagowywać tekstu.
                Przykład zamiany:
                Wejście: Informacje o podejrzanym: Marek Jankowski. Mieszka w Białymstoku na ulicy Lipowej 9. Wiek: 26 lat.
                Wyjście: Informacje o podejrzanym: CENZURA. Mieszka w CENZURA na ulicy CENZURA. Wiek: CENZURA lat.
                Tekst do zamiany:
                ${this.downloadedFileContent}`;

            const payload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.openAiPrompt,
            };

            // Wysłanie prompta do OpenAI przez backend
            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, payload)
                .toPromise();

            if (aiResponse && aiResponse.choices && aiResponse.choices.length > 0) {
                this.processedFileContent = aiResponse.choices[0].message.content.trim();
                console.log('Processed file content:', this.processedFileContent);
            } else {
                console.error('Failed to process data with OpenAI: response is invalid.');
                return;
            }

            // Krok 3: Wysłanie przetworzonego pliku do raportu
            this.processStatus = 'Submitting processed data...';

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: this.processedFileContent,
            };

            this.reportResponse = await this.http
                .post(`${this.backendUrl}/submit-processed-file`, reportPayload)
                .toPromise();

            console.log('Report response:', this.reportResponse);

            this.processStatus = 'Lesson process completed successfully.';
        } catch (error) {
            console.error('Error in processLesson:', error);
            this.processStatus = 'Error occurred during the lesson process.';
        }
    }
}
