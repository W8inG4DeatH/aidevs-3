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
    public reportsFilesNames: string[] = [];
    public factsData: string = '';

    public aiPrompt: string =
`### Wczuj się w rolę eksperta SEO. Twoim zadaniem jest utworzenie listy najważniejszych słów kluczowych w języku polskim (w mianowniku), które opisują daną treść. Słowa kluczowe nie mogą się powtarzać. Pracuj krok po kroku:
1. Analiza treści '<main-content>':
- Stwórz listę 15 słów kluczowych (maksymalnie), które najlepiej opisują treść '<main-content>'.
- Zapamiętaj tę listę w zmiennej reportFileKeys jako tablicę bez powtarzających się elementów.
2. Analiza treści elementów '<doc>':
- Treść '<doc>s' jest podzielona na sekcje słowem '<doc>'.
- Dla każdej sekcji sprawdź, czy jakakolwiek osoba wymieniona w tej sekcji występuje również w treści '<main-content>'.
- Jeśli znajdziesz zgodność, wygeneruj listę 10 słów kluczowych dla tej sekcji '<doc>' i dodaj je do tablicy reportFileKeys. Unikaj dodawania powtarzających się słów kluczowych.
3. Analiza treści elementów '<fact>':
- Treść '<fact>s' jest podzielona na sekcje słowem '<fact>'.
- Dla każdej sekcji sprawdź, czy jakakolwiek osoba wymieniona w tej sekcji występuje również w treści '<main-content>'.
- Jeśli znajdziesz zgodność, wygeneruj listę 10 słów kluczowych dla tej sekcji '<fact>' i dodaj je do tablicy reportFileKeys. Unikaj dodawania powtarzających się słów kluczowych.
4. Wynik końcowy:
- Response to tylko zawartość tablicy reportFileKeys w formie:
klucz, klucz, ..., klucz
- Wypisz słowa kluczowe w jednej linii, oddzielone przecinkami, bez dodatkowego formatowania.
### Zasady:
- Przy wyborze słów kluczowych skupiaj się głównie na: nazwy własne i rzeczowniki.
- Wszystkie kroki wykonuj w logicznej kolejności.
\n`;

    public responseJson: any = {};
    public processStatus: string = '';
    public reportResponse: any = '';

    public backendUrl = `${environment.apiUrl}/lessons/s03e01`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            this.processStatus = 'Fetching files from server...';
            console.log('Step 1: Fetching files from server.');

            // Fetch the list of files from the backend
            const response: any = await this.http.get(`${this.backendUrl}/get-mixed-files`).toPromise();
            const allFiles = response.files;
            console.log('Files fetched:', allFiles);
            this.processStatus = 'Files fetched successfully.';

            // Separate files into factsFilesNames and reportsFilesNames
            this.factsFilesNames = allFiles.filter((fileName: string) => /^f\d{2}\.txt$/.test(fileName));
            this.reportsFilesNames = allFiles.filter(
                (fileName: string) => !/^f\d{2}\.txt$/.test(fileName) && fileName.endsWith('.txt'),
            );
            console.log('Facts files:', this.factsFilesNames);
            console.log('Reports files:', this.reportsFilesNames);

            // Read content of factsFilesNames and combine into factsData
            this.factsData = '';
            console.log('Step 2: Reading facts files content.');

            for (let fileName of this.factsFilesNames) {
                const fileContentResponse: any = await this.http
                    .post(`${this.backendUrl}/get-text-file-content`, { fileName })
                    .toPromise();
                const fileContent = fileContentResponse.content;
                this.factsData += '<fact>' + fileContent + '</fact>\n';
            }
            console.log('Facts Data:', this.factsData);

            // Process report files
            this.responseJson = {};
            console.log('Step 3: Processing report files.');

            for (let reportFile of this.reportsFilesNames) {
                this.processStatus = `Processing report file: ${reportFile}`;
                console.log(`Processing report file: ${reportFile}`);

                // Get content of reportFile
                const fileContentResponse: any = await this.http
                    .post(`${this.backendUrl}/get-text-file-content`, { fileName: reportFile })
                    .toPromise();
                const reportContent = '<main-content>' + fileContentResponse.content + '</main-content>\n';
                console.log(reportContent);

                // Prepare otherDocsData by summing up content of other report files
                let otherDocsData = '';
                for (let otherFile of this.reportsFilesNames) {
                    if (otherFile !== reportFile) {
                        const otherFileContentResponse: any = await this.http
                            .post(`${this.backendUrl}/get-text-file-content`, { fileName: otherFile })
                            .toPromise();
                        const otherFileContent = '<doc>' + otherFileContentResponse.content + '</doc>\n';
                        otherDocsData += otherFileContent + '\n';
                    }
                }
                console.log('Docs Data:', otherDocsData);

                // Prepare the prompt
                const content = `${reportContent}\n${otherDocsData}\n${this.factsData}`;
                const prompt = `${this.aiPrompt}\n\n${content}`;
                console.log('Generated prompt for AI:', prompt);

                // Send to AI model
                const aiPayload = {
                    openAiModel: this.openAiModel,
                    myAIPrompt: prompt,
                };
                const aiResponse: any = await this.http
                    .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                    .toPromise();

                // Extract the response
                const responseContent = aiResponse?.choices?.[0]?.message?.content || '';
                console.log(`AI response for ${reportFile}:`, responseContent);

                // Collect the response in responseJson
                this.responseJson[reportFile] = responseContent;
            }
            console.log('Collected responses:', this.responseJson);

            // Step 4: Send responseJson to Headquarters
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
