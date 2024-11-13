import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
    ImageModelQualityEnum,
    ImageModelSizeEnum,
    IOpenAIModel,
} from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s02e03',
    templateUrl: './lesson-s02e03.component.html',
    styleUrls: ['./lesson-s02e03.component.scss'],
})
export class LessonS02E03Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.DallE3;
    public imageModelSize: ImageModelSizeEnum = ImageModelSizeEnum.Quad;
    public imageModelQuality: ImageModelQualityEnum = ImageModelQualityEnum.Standard;

    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public jsonData: any = {}; // Dane JSON
    public imageUrl: string | null = null; // URL obrazka
    public reportResponse: any = ''; // Przechowywanie odpowiedzi z Centrali
    public processStatus: string = '';
    public backendUrl = `${environment.apiUrl}/lessons/s02e03`;
    public taskIdentifier: string = 'robotid';

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            this.processStatus = 'Fetching data from the server...';

            // Zdefiniowanie payloadu z kluczem API do pobrania JSON-a
            const payload = { apiKey: this.apiKey };

            // Wysłanie żądania POST z payloadem
            const response: any = await this.http.post(`${this.backendUrl}/fetch-remote-json`, payload).toPromise();

            console.log('Fetched JSON Data:', response);
            this.jsonData = response;
            this.processStatus = 'Data fetched successfully.';

            // Krok 2: Generacja obrazu
            await this.generateImage(response.description);
        } catch (error) {
            console.error('Error in processLesson:', error);
            this.processStatus = 'Error fetching data.';
        }
    }

    async generateImage(prompt: string) {
        this.processStatus = 'Generating image...';
        const payload = {
            text: prompt,
            model: this.openAiModel,
            size: this.imageModelSize,
            quality: this.imageModelQuality,
        };

        try {
            const imageResponse: any = await this.http
                .post(`${this.backendUrl}/openai-text-to-image`, payload)
                .toPromise();

            this.imageUrl = imageResponse.imageUrl; // Przypisujemy URL obrazka
            this.processStatus = 'Image generated successfully.';

            // Krok 3: Wysyłka URL obrazka do Centrali
            if (this.imageUrl) {
                await this.sendImageToCentrala(this.imageUrl);
            } else {
                console.error('Image generation failed; no URL to send to Centrala.');
                this.processStatus = 'Image generation failed.';
            }
        } catch (error) {
            console.error('Error generating image:', error);
            this.processStatus = 'Error generating image.';
        }
    }

    async sendImageToCentrala(imageUrl: string) {
        this.processStatus = 'Sending image URL to Centrala...';
        const reportPayload = {
            task: this.taskIdentifier,
            apikey: this.apiKey,
            answer: imageUrl, // URL obrazka
        };
        const reportUrl = 'https://centrala.ag3nts.org/report';

        try {
            this.reportResponse = await this.http.post(reportUrl, reportPayload).toPromise();
            console.log('Odpowiedź raportu:', this.reportResponse);
            this.processStatus = 'Lesson process completed successfully.';
        } catch (error) {
            console.error('Błąd podczas wysyłania odpowiedzi do Centrali:', error);
            this.processStatus = 'Nie udało się wysłać odpowiedzi.';
        }
    }
}
