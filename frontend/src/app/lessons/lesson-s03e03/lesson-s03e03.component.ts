import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s03e03',
    templateUrl: './lesson-s03e03.component.html',
    styleUrls: ['./lesson-s03e03.component.scss'],
})
export class LessonS03E03Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'database';

    public processStatus: string = '';
    public tableStructures: any = {};
    public aiPrompt: string = '';
    public aiGeneratedQuery: string = '';
    public databaseAnswer: any = '';
    public reportResponse: any = '';

    public backendUrl = `${environment.apiUrl}/lessons/s03e03`;

    // Prompty AI
    public aiPromptStep2: string = `Mając poniższe struktury tabel:
{{tableStructures}}
Napisz zapytanie SQL, które zwraca identyfikatory (dc_id) z tabeli "datacenters", gdzie:
- datacenter (datacenters.is_active = 1) jest aktywne
- manager (users.is_active = 0) jest na urlopie.
Tabele są połączone w następujący sposób:
- datacenters.manager wskazuje na users.id.
Zwróć tylko poprawne zapytanie SQL bez dodatkowego tekstu, dekoracji i markdown.
`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            // Krok 1: Pobierz strukturę tabel
            this.processStatus = 'Fetching table structures...';
            console.log(this.processStatus);

            const tables = ['users', 'datacenters', 'connections'];
            this.tableStructures = {};

            for (let tableName of tables) {
                const payload = {
                    task: this.taskIdentifier,
                    apikey: this.apiKey,
                    query: `SHOW CREATE TABLE ${tableName}`,
                };

                const response: any = await this.http.post(`${this.backendUrl}/proxy-apidb`, payload).toPromise();

                console.log(`Response for table ${tableName}:`, response);

                if (response && response.reply && response.reply.length > 0) {
                    const createTableSql = response.reply[0]['Create Table'];
                    this.tableStructures[tableName] = createTableSql;
                } else {
                    console.warn(`No valid data returned for table: ${tableName}`);
                    this.tableStructures[tableName] = 'No structure available';
                }
            }

            console.log('Final table structures:', this.tableStructures);

            // Krok 2: Generowanie zapytania SQL przez AI
            this.processStatus = 'Generating SQL query with AI...';
            console.log(this.processStatus);

            this.aiPrompt = this.aiPromptStep2.replace(
                '{{tableStructures}}',
                JSON.stringify(this.tableStructures, null, 2),
            );

            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.aiPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();

            this.aiGeneratedQuery = aiResponse?.choices?.[0]?.message?.content.trim();
            console.log('Generated SQL Query:', this.aiGeneratedQuery);

            // Krok 3: Wykonanie zapytania SQL
            this.processStatus = 'Executing SQL query...';
            console.log(this.processStatus);

            const queryPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                query: this.aiGeneratedQuery,
            };

            const queryResponse: any = await this.http.post(`${this.backendUrl}/proxy-apidb`, queryPayload).toPromise();

            console.log('Response from backend:', queryResponse);

            if (queryResponse && queryResponse.reply && queryResponse.reply.length > 0) {
                this.databaseAnswer = queryResponse.reply.map((row: any) => row.dc_id); // Pobierz tylko dc_id
                console.log('Database answer:', this.databaseAnswer);
            } else {
                console.warn('No valid data returned for the query.');
                this.databaseAnswer = [];
            }

            // Krok 4: Przesłanie odpowiedzi do centrali
            await this.sendJsonToHeadquarters();

            this.processStatus = 'Lesson process completed successfully.';
        } catch (error) {
            this.processStatus = 'Error processing lesson.';
            console.error(this.processStatus, error);
        }
    }

    async sendJsonToHeadquarters() {
        try {
            this.processStatus = 'Sending answers to Headquarters...';
            console.log(this.processStatus);

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: this.databaseAnswer,
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
