import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s02e02',
    templateUrl: './lesson-s02e02.component.html',
    styleUrls: ['./lesson-s02e02.component.scss'],
})
export class LessonS02E02Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public mapFileName: string = 'mapa-miasta.jpg';
    public mapImageUrl: string = ''; // URL to display the image
    public visionAIPrompt: string = `
Wciel się w rolę eksperta od historii polskich miast. Załączony obraz przedstawia cztery fragmenty map, z których trzy należą do jednego miasta nad rzeką, a jeden pochodzi z innego miejsca i powinien zostać wyeliminowany. Twoim zadaniem jest odnalezienie miasta, które charakteryzuje się poniższymi, unikalnymi cechami:
Monumentalne spichlerze położone nad szeroką rzeką, Wisłą, co jest wyjątkowe w skali Polski. Te spichlerze pełniły kluczową rolę gospodarczą, magazynując towary spławiane do innych miast.
Twierdza obronna i silne fortyfikacje – miasto miało strategiczne znaczenie obronne i dlatego posiadało rozbudowane umocnienia, co wpływa na układ ulic i charakter urbanistyczny.
Układ średniowiecznego miasta nad dużą rzeką, który odzwierciedla gospodarcze znaczenie spichlerzy oraz twierdzy.
Proszę, abyś przeanalizował każdą możliwą kombinację trzech fragmentów spośród czterech i sprawdził, która grupa najlepiej pasuje do miasta o opisanych cechach. Szukane miasto to rzadki przypadek, który łączy obecność spichlerzy, dużą rzekę (Wisłę) oraz fortyfikacje, a także specyficzny średniowieczny układ urbanistyczny.
Podaj odpowiedź w formacie: [Nazwa miasta]: [Lista nazw ulic, które należą do tego miasta] i zaznacz, który fragment mapy powinien zostać odrzucony jako niepasujący.
    `;
    public processStatus: string = '';
    public aiResponse: string = '';
    public backendUrl = `${environment.apiUrl}/lessons/s02e02`;

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.loadMapImage();
    }

    loadMapImage() {
        // Construct the URL to fetch the image from the backend
        this.mapImageUrl = `${this.backendUrl}/get-map-image?filename=${this.mapFileName}`;
    }

    async processLesson() {
        try {
            this.processStatus = 'Wysyłanie obrazu do modelu AI...';

            const payload = {
                imageFileName: this.mapFileName,
                prompt: this.visionAIPrompt,
                model: this.openAiModel, // Pass the model name from the frontend
            };

            const response: any = await this.http.post(`${this.backendUrl}/process-image`, payload).toPromise();

            if (response && response.result) {
                this.aiResponse = response.result;
                console.log('AI Response:', this.aiResponse);
                this.processStatus = 'Proces zakończony pomyślnie.';
            } else {
                console.error('Nie udało się uzyskać odpowiedzi z modelu AI.');
                this.processStatus = 'Błąd podczas przetwarzania przez model AI.';
            }
        } catch (error) {
            console.error('Błąd w processLesson:', error);
            this.processStatus = 'Wystąpił błąd podczas procesu.';
        }
    }
}
