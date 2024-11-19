import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s03e01',
    templateUrl: './lesson-s03e01.component.html',
    styleUrls: ['./lesson-s03e01.component.scss'],
})
export class LessonS03E01Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'dokumenty';

    public factsFilesNames: string[] = [];
    public raportsFilesNames: string[] = [];
    public responseJson: any = {};
    public processStatus: string = '';
    public reportResponse: any = '';

    public backendUrl = `${environment.apiUrl}/lessons/s03e01`;

    public factsAIPrompt: string = `
### Wczuj się w rolę eksperta SEO. Twoim zadaniem jest utworzenie listy najważniejszych słów kluczowych w języku polskim (w mianowniku), które opisują daną treść. Słowa kluczowe nie mogą się powtarzać. Przy wyborze słów kluczowych skupiaj się głównie na: nazwy własne i rzeczowniki.
Wynik końcowy: zwróć słowa kluczowe w jednym wierszu, oddzielone przecinkami i spacjami, bez kropki ani przecinka na koncu, np.: słowo1, słowo2, słowo3`;

    public raportsAIPrompt: string = `
### Wczuj się w rolę eksperta SEO. Twoim zadaniem jest utworzenie listy najważniejszych słów kluczowych w języku polskim (w mianowniku), które opisują daną treść. Słowa kluczowe nie mogą się powtarzać. Przy wyborze słów kluczowych skupiaj się głównie na: nazwy własne i rzeczowniki.
Dodatkowo: z nazwy pliku '{{fileName}}' wyodrębnij nazwę sektora (np. "sektor C4") i umieść ją jako pierwsze słowo kluczowe na liście.
#### Przykład:
Nazwa pliku: 2024-11-12_report-00-sektor_C4.txt
Lista słów kluczowych: sektor C4, dane, inspekcja, kontrola, fabryka, system, baza danych.
Wynik końcowy: zwróć słowa kluczowe w jednym wierszu, oddzielone przecinkami i spacjami, bez kropki ani przecinka na koncu, np.: słowo1, słowo2, słowo3`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    private addSuffixToFileName(fileName: string, suffix: string): string {
        const dotIndex = fileName.lastIndexOf('.');
        if (dotIndex === -1) {
            return fileName + suffix;
        }
        return fileName.substring(0, dotIndex) + suffix + fileName.substring(dotIndex);
    }

    async processLesson() {
        try {
            this.processStatus = 'Fetching files from server...';
            console.log('Step 1: Fetching files from server.');

            // Pobierz listę plików z serwera
            const initialResponse: any = await this.http.get(`${this.backendUrl}/get-mixed-files`).toPromise();
            const allFiles: string[] = initialResponse.files; // Zawiera wszystkie pliki w katalogu
            console.log('Files fetched:', allFiles);

            // Podziel pliki na fakty i raporty
            this.factsFilesNames = allFiles.filter((fileName: string) => /^f\d{2}\.txt$/.test(fileName));
            this.raportsFilesNames = allFiles.filter(
                (fileName: string) =>
                    !/^f\d{2}\.txt$/.test(fileName) && fileName.endsWith('.txt') && !fileName.endsWith('_.txt'),
            );
            console.log('Facts files:', this.factsFilesNames);
            console.log('Raport files:', this.raportsFilesNames);

            // Procesuj pliki raportów
            for (let raportFileName of this.raportsFilesNames) {
                const raportFileName_ = this.addSuffixToFileName(raportFileName, '_');

                // Sprawdź, czy istnieje plik z kluczami
                if (allFiles.includes(raportFileName_)) {
                    console.log(`File ${raportFileName_} already exists. Skipping AI processing.`);
                    continue;
                }

                // Pobierz zawartość pliku
                const fileContentResponse: any = await this.http
                    .post(`${this.backendUrl}/get-text-file-content`, { fileName: raportFileName })
                    .toPromise();
                const reportContent = fileContentResponse.content;

                // Wygeneruj prompt dla AI
                const prompt = this.raportsAIPrompt.replace('{{fileName}}', raportFileName);
                const aiPrompt = `${prompt}\n\n${reportContent}`;
                console.log('Generated AI prompt:', aiPrompt);

                // Wyślij do AI modelu
                const aiPayload = {
                    openAiModel: this.openAiModel,
                    myAIPrompt: aiPrompt,
                };
                const aiResponse: any = await this.http
                    .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                    .toPromise();

                const responseContent = aiResponse?.choices?.[0]?.message?.content || '';
                console.log(`AI response for ${raportFileName}:`, responseContent);

                // Zapisz odpowiedź do pliku
                await this.http
                    .post(`${this.backendUrl}/save-text-file-content`, {
                        fileName: raportFileName_,
                        content: responseContent,
                    })
                    .toPromise();
            }

            // Procesuj pliki faktów
            for (let factFileName of this.factsFilesNames) {
                const factFileName_ = this.addSuffixToFileName(factFileName, '_');

                // Sprawdź, czy istnieje plik z kluczami
                if (allFiles.includes(factFileName_)) {
                    console.log(`File ${factFileName_} already exists. Skipping AI processing.`);
                    continue;
                }

                // Pobierz zawartość pliku
                const fileContentResponse: any = await this.http
                    .post(`${this.backendUrl}/get-text-file-content`, { fileName: factFileName })
                    .toPromise();
                const factContent = fileContentResponse.content;

                // Wygeneruj prompt dla AI
                const aiPrompt = `${this.factsAIPrompt}\n\n${factContent}`;
                const aiPayload = {
                    openAiModel: this.openAiModel,
                    myAIPrompt: aiPrompt,
                };
                const aiResponse: any = await this.http
                    .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                    .toPromise();

                const responseContent = aiResponse?.choices?.[0]?.message?.content || '';
                console.log(`AI response for ${factFileName}:`, responseContent);

                // Zapisz odpowiedź do pliku
                await this.http
                    .post(`${this.backendUrl}/save-text-file-content`, {
                        fileName: factFileName_,
                        content: responseContent,
                    })
                    .toPromise();
            }

            // Odczytaj istniejące pliki z kluczami i wygeneruj JSON
            this.responseJson = {};
            for (let raportFileName of this.raportsFilesNames) {
                const raportFileName_ = this.addSuffixToFileName(raportFileName, '_');

                // Pobierz zawartość istniejącego pliku z kluczami
                const fileContentResponse: any = await this.http
                    .post(`${this.backendUrl}/get-text-file-content`, { fileName: raportFileName_ })
                    .toPromise();
                const raportKeywords = fileContentResponse.content.split(',').map((kw: string) => kw.trim());

                let additionalKeys: string[] = [];
                for (let otherRaportFileName of this.raportsFilesNames) {
                    if (otherRaportFileName !== raportFileName) {
                        const otherRaportFileName_ = this.addSuffixToFileName(otherRaportFileName, '_');
                        const otherFileContentResponse: any = await this.http
                            .post(`${this.backendUrl}/get-text-file-content`, { fileName: otherRaportFileName_ })
                            .toPromise();
                        const otherRaportKeywords = otherFileContentResponse.content
                            .split(',')
                            .map((kw: string) => kw.trim());
                        additionalKeys = additionalKeys.concat(otherRaportKeywords);
                    }
                }

                for (let factFileName of this.factsFilesNames) {
                    const factFileName_ = this.addSuffixToFileName(factFileName, '_');
                    const factFileContentResponse: any = await this.http
                        .post(`${this.backendUrl}/get-text-file-content`, { fileName: factFileName_ })
                        .toPromise();
                    const factKeywords = factFileContentResponse.content.split(',').map((kw: string) => kw.trim());
                    additionalKeys = additionalKeys.concat(factKeywords);
                }

                const allKeywords = Array.from(new Set([...raportKeywords, ...additionalKeys]));
                this.responseJson[raportFileName] = allKeywords.join(', ');
            }

            // Wyślij dane do centrali
            await this.sendJsonToHeadquarters(this.responseJson);
        } catch (error) {
            this.processStatus = 'Error processing lesson.';
            console.error(this.processStatus, error);
        }
    }

    async sendJsonToHeadquarters(answersJson: any) {
        try {
            this.processStatus = 'Sending answers to Headquarters...';
            console.log(this.processStatus);

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: answersJson,
            };

            const reportUrl = 'https://centrala.ag3nts.org/report';

            this.reportResponse = await this.http.post(reportUrl, reportPayload).toPromise();
            this.processStatus = 'Lesson process completed successfully.';
            console.log(this.processStatus);
            console.log('Report response:', this.reportResponse);
        } catch (error) {
            this.processStatus = 'Failed to send data to Headquarters.';
            console.error(this.processStatus, error);
        }
    }
}
