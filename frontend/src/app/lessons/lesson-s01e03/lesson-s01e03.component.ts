import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

interface TestDataItem {
    answer: number;
    question: string;
    test?: {
        a: string;
        q: string;
    };
}

interface CalibrationFileContent {
    apikey: string;
    copyright: string;
    description: string;
    'test-data': TestDataItem[];
}

@Component({
    selector: 'app-lesson-s01e03',
    templateUrl: './lesson-s01e03.component.html',
    styleUrls: ['./lesson-s01e03.component.scss'],
})
export class LessonS01E03Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;

    public openAiPrompt: string = '';
    public calibrationFileContent: CalibrationFileContent | null = null;
    public correctedFileContent: CalibrationFileContent | null = null;
    public reportResponse: any = null;
    public processStatus: string = '';
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'JSON';

    private backendUrl = `${environment.apiUrl}/lessons/s01e03`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            this.processStatus = 'Starting lesson process...';
            console.log(this.processStatus);

            // Krok 1: Pobieranie pliku kalibracyjnego
            const downloadResponse: CalibrationFileContent | undefined = await this.http
                .get<CalibrationFileContent>(`${this.backendUrl}/download-proxy-file`)
                .toPromise();
            if (downloadResponse) {
                this.calibrationFileContent = downloadResponse;
            } else {
                console.error('Failed to download calibration file: response is undefined.');
                return;
            }

            // Krok 2: Przetwarzanie każdego pytania w `test-data`
            if (this.calibrationFileContent) {
                for (const item of this.calibrationFileContent['test-data']) {
                    const match = item.question.match(/^(\d+)\s*\+\s*(\d+)$/);

                    // Jeśli question jest równaniem matematycznym (np. "70 + 40"), obliczamy answer lokalnie.
                    if (match) {
                        const x = parseInt(match[1], 10);
                        const y = parseInt(match[2], 10);
                        const calculatedAnswer = x + y;

                        if (item.answer !== calculatedAnswer) {
                            item.answer = calculatedAnswer;
                            console.log(`Updated answer for question "${item.question}":`, item.answer);
                        }
                    }

                    // Jeśli question nie jest równaniem matematycznym, sprawdzamy czy zawiera `test`.
                    if (item.test && item.test.q) {
                        this.openAiPrompt = `Podaj tylko samą odpowiedź na pytanie w języku, w jakim jest pytanie. Pytanie: ${item.test.q}`;
                        const payload = {
                            openAiModel: this.openAiModel,
                            myAIPrompt: this.openAiPrompt,
                        };

                        // Wysyłanie zapytania do OpenAI dla pytania `test.q`
                        const aiResponse: any = await this.http
                            .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, payload)
                            .toPromise();

                        // Aktualizowanie `a` w obiekcie `test` odpowiedzią AI.
                        item.test.a = aiResponse.choices[0].message.content.trim();
                        console.log(`AI updated answer for test question "${item.test.q}":`, item.test.a);
                    }
                }
            }

            // Zaktualizowanie zawartości pliku
            this.correctedFileContent = this.calibrationFileContent;

            // Dodanie klucza API przed wysłaniem
            if (this.calibrationFileContent) {
                this.calibrationFileContent.apikey = this.apiKey;
            }

            const correctedFileString = JSON.stringify(this.calibrationFileContent);
            console.log('Prepared corrected file:', correctedFileString);

            // Wysyłanie poprawionego pliku
            this.reportResponse = await this.http
                .post(`${this.backendUrl}/submit-corrected-file`, {
                    correctedFile: correctedFileString,
                    apiKey: this.apiKey,
                    taskIdentifier: this.taskIdentifier,
                })
                .toPromise();
            console.log('Report response:', this.reportResponse);
            this.processStatus = 'Lesson process completed successfully.';
        } catch (error) {
            console.error('Error in processLesson:', error);
            this.processStatus = 'Error occurred during the lesson process.';
        }
    }
}
