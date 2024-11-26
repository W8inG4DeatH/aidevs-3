import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s04e01',
    templateUrl: './lesson-s04e01.component.html',
    styleUrls: ['./lesson-s04e01.component.scss'],
})
export class LessonS04E01Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'photos';

    public processStatus: string = '';
    public images: any[] = []; // Array to hold images and their statuses
    public processLogs: string[] = []; // Logs for display
    public mainAnswer: string = '';
    public reportResponse: any = '';

    public baseUrl: string = 'https://centrala.ag3nts.org/dane/barbara/';

    public backendUrl = `${environment.apiUrl}/lessons/s04e01`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            this.processStatus = 'Starting conversation with automaton...';
            console.log(this.processStatus);

            const payload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: 'START',
            };

            const response: any = await this.http.post(`${this.backendUrl}/start-conversation`, payload).toPromise();

            console.log('Response from Central:', response);

            if (response && response.message) {
                const message = response.message;

                // Wyrażenie regularne do wyodrębnienia nazw plików
                const fileNames = message.match(/\bIMG_\d+(_[A-Z0-9]+)?\.(png|jpg|jpeg)\b/gi) || [];

                // Tworzenie pełnych URL-i na podstawie nazwy pliku i `baseUrl`
                this.images = fileNames.map((fileName: any) => {
                    const fullUrl = `${this.baseUrl}${fileName}`;
                    return {
                        originalUrl: fullUrl, // Ustawianie oryginalnego URL-a
                        url: fullUrl,
                        fileName,
                        operations: [],
                        description: '',
                    };
                });

                console.log('Images:', this.images);
            } else {
                console.warn('No images received from Central.');
                this.images = [];
            }

            this.processStatus = 'Images received and displayed.';
        } catch (error) {
            this.processStatus = 'Error starting conversation.';
            console.error(this.processStatus, error);
        }
    }

    extractFileName(imageUrl: string): string {
        return imageUrl.split('/').pop() || '';
    }

    applyOperation(image: any, operation: string) {
        const command = `${operation} ${image.fileName}`;
        const payload = {
            task: this.taskIdentifier,
            apikey: this.apiKey,
            answer: command,
        };

        this.http.post(`${this.backendUrl}/send-command`, payload).subscribe(
            (response: any) => {
                console.log(`Response for command ${command}:`, response);

                if (response && response.message) {
                    // Wyodrębnianie nazwy pliku z odpowiedzi
                    const newFileName = response.message.match(/\bIMG_\d+(_[A-Z0-9]+)?\.(png|jpg|jpeg)\b/i)?.[0];

                    if (newFileName) {
                        // Aktualizacja tylko `url`, `originalUrl` pozostaje bez zmian
                        image.url = `${this.baseUrl}${newFileName}`;
                        image.fileName = newFileName;
                        console.log(`Image updated: ${image.fileName}`);
                    }
                }

                // Dodawanie operacji do listy
                image.operations.push(operation);
            },
            (error) => {
                console.error(`Error applying operation ${operation} to image ${image.fileName}:`, error);
            },
        );
    }

    async sendImageDescription(image: any) {
        try {
            this.processLogs.push(`Processing image file: ${image.fileName}`);

            // Prepare the payload for the process-image endpoint
            const payload = {
                imageFileName: image.fileName, // Aktualna nazwa pliku po operacjach
                baseUrl: this.baseUrl, // URL bazowy
                prompt: `Przedstaw szczegółowy opis osoby na zdjęciu: ${image.fileName}`,
                model: this.openAiModel,
            };

            // Send the image for processing
            const response: any = await this.http.post(`${this.backendUrl}/process-image`, payload).toPromise();
            console.log('Response from process-image:', response);

            // Extract the result and update the image description
            image.description = response.result || '';

            // Update the main answer
            this.mainAnswer = image.description;

            // Log success
            this.processLogs.push(`Image ${image.fileName} processed successfully.`);

            // Send the final answer to Headquarters
            await this.sendJsonToHeadquarters();
        } catch (error) {
            console.error(`Error processing image file ${image.fileName}:`, error);
            this.processLogs.push(`Error processing image file: ${image.fileName}`);
        }
    }

    async sendJsonToHeadquarters() {
        try {
            this.processStatus = 'Sending answer to Headquarters...';
            console.log(this.processStatus);

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: this.mainAnswer,
            };

            const reportUrl = 'https://centrala.ag3nts.org/report';

            this.reportResponse = await this.http.post(reportUrl, reportPayload).toPromise();
            this.processStatus = 'Answer sent to Headquarters.';
            console.log(this.processStatus);
            console.log('Report response:', this.reportResponse);
        } catch (error) {
            this.processStatus = 'Failed to send data to Headquarters.';
            console.error(this.processStatus, error);
        }
    }
}
