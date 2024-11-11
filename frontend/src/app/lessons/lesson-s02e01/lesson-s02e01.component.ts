import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s02e01',
    templateUrl: './lesson-s02e01.component.html',
    styleUrls: ['./lesson-s02e01.component.scss'],
})
export class LessonS02E01Component implements OnInit {
    public audioFilesNames: string[] = [
        'adam.m4a',
        'agnieszka.m4a',
        'ardian.m4a',
        'michal.m4a',
        'monika.m4a',
        'rafal.m4a',
    ];
    public openAiTTSModel: IOpenAIModel = IOpenAIModel.SpeechToText;
    public openAiModel: IOpenAIModel = IOpenAIModel.O1Preview;

    public transcribedTexts: string[] = [];
    public openAiPrompt: string = '';
    public keyAnswer: string = '';
    public reportResponse: any = null;
    public processStatus: string = '';
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'mp3';

    private backendUrl = `${environment.apiUrl}/lessons/s02e01`;

    constructor(private http: HttpClient) { }

    ngOnInit() { }

    async processLesson() {
        try {
            this.processStatus = 'Rozpoczynanie procesu lekcji...';
            console.log(this.processStatus);

            // Krok 1: Przesłanie nazw plików audio do backendu
            this.processStatus = 'Transkrypcja plików audio...';
            const transcriptionPayload = {
                audioFilesNames: this.audioFilesNames,
                model: this.openAiTTSModel,
            };

            const transcriptionResponse: any = await this.http
                .post(`${this.backendUrl}/transcribe-audio-files`, transcriptionPayload)
                .toPromise();

            if (transcriptionResponse && transcriptionResponse.transcriptions) {
                this.transcribedTexts = transcriptionResponse.transcriptions;
                console.log('Transkrypcje:', this.transcribedTexts);
            } else {
                console.error('Nie udało się transkrybować plików audio.');
                return;
            }

            // Krok 2: Przygotowanie prompta OpenAI
            this.processStatus = 'Przetwarzanie danych z OpenAI...';

            // Tworzenie combinedText z nazwami plików (bez rozszerzeń) i transkrypcjami
            const combinedText = this.audioFilesNames.map((fileName, index) => {
                const nameWithoutExtension = fileName.split('.')[0];  // Usunięcie rozszerzenia
                return `${nameWithoutExtension}: ${this.transcribedTexts[index]}`;
            }).join('\n');

            const openAiPromptQuestion: string = "Przeanalizuj dokładnie transkrypcje i pomyśl nad nimi. Twoim celem jest dowiedzenie się, na jakiej ulicy znajduje się uczelnia, na której wykłada Andrzej Maj. Pamiętaj, że nazwa ulicy nie pada w treści transkrypcji. Zeznania świadków mogą być sprzeczne, niektórzy z nich mogą się mylić, a inni odpowiadać w dość dziwaczny sposób. Musisz więc użyć swojej ogólnej wiedzy o uczelniach w Polsce, aby uzyskać odpowiedź. W odpowiedzi podaj tylko samą nazwę własną ulicy, na której znajduje się uczelnia, na której wykłada Andrzej Maj. Podaj nazwę ulicy bez znaków interpunkcyjnych.";

            this.openAiPrompt = `${openAiPromptQuestion}:
                Transkrypcje:
                ${combinedText}`;

            console.log('this.openAiPrompt:', this.openAiPrompt);

            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.openAiPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();

            if (aiResponse && aiResponse.choices && aiResponse.choices.length > 0) {
                this.keyAnswer = aiResponse.choices[0].message.content.trim();
                console.log('Odpowiedź:', this.keyAnswer);
            } else {
                console.error('Nie udało się uzyskać odpowiedzi z OpenAI.');
                return;
            }

            // Krok 3: Wysłanie KEY_ANSWER do Centrali
            this.processStatus = 'Wysyłanie odpowiedzi...';

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: this.keyAnswer,
            };

            // Bezpośrednie wywołanie endpointu serwisu zewnętrznego z Angulara
            const reportUrl = 'https://centrala.ag3nts.org/report';

            try {
                this.reportResponse = await this.http.post(reportUrl, reportPayload).toPromise();
                console.log('Odpowiedź raportu:', this.reportResponse);
                this.processStatus = 'Proces lekcji zakończony pomyślnie.';
            } catch (error) {
                console.error('Błąd podczas wysyłania odpowiedzi do Centrali:', error);
                this.processStatus = 'Nie udało się wysłać odpowiedzi.';
            }
        } catch (error) {
            console.error('Błąd w processLesson:', error);
            this.processStatus = 'Wystąpił błąd podczas procesu lekcji.';
        }
    }
}
