import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s03e02',
    templateUrl: './lesson-s03e02.component.html',
    styleUrls: ['./lesson-s03e02.component.scss'],
})
export class LessonS03E02Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'wektory';
    public processStatus: string = '';
    public baseAnswer: string = '';
    public reportResponse: any = '';
    public aiPrompt: string = '';

    public backendUrl = `${environment.apiUrl}/lessons/s03e02`;
    public backendUrls03e01 = `${environment.apiUrl}/lessons/s03e01`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            this.processStatus = 'Indexing report files...';
            console.log('Step 1: Indexing report files.');

            // Call backend to index reports
            await this.http.post(`${this.backendUrl}/index-reports`, {}).toPromise();
            console.log('Indexing completed.');

            this.processStatus = 'Indexing completed. Querying the database...';

            // Prepare the query
            const queryText = 'W raporcie, z którego dnia znajduje się wzmianka o kradzieży prototypu broni?';

            // Send the query to the backend
            const queryResponse: any = await this.http
                .post(`${this.backendUrl}/query-reports`, { query: queryText })
                .toPromise();

            this.baseAnswer = queryResponse.date || 'No date found.';
            console.log('Query result:', this.baseAnswer);

            this.processStatus = 'Query completed. Sending answer to Headquarters...';

            // Send the answer to Headquarters
            await this.sendJsonToHeadquarters();

            this.processStatus = 'Lesson process completed successfully.';
        } catch (error) {
            this.processStatus = 'Error processing lesson.';
            console.error(this.processStatus, error);
        }
    }

    async processLessonR() {
        try {
            this.processStatus = 'Fetching report files and generating prompt...';
            console.log(this.processStatus);

            // Step 1: Fetch the list of all files from the "do-not-share" subfolder
            const filesResponse: any = await this.http
                .get(`${this.backendUrls03e01}/get-mixed-files?subfolder=do-not-share`)
                .toPromise();
            const allFiles: string[] = filesResponse.files;
            console.log('Fetched files from do-not-share:', allFiles);

            // Step 2: Filter report files
            const reportFiles = allFiles.filter((fileName: string) => fileName.endsWith('.txt'));
            console.log('Report files:', reportFiles);

            // Step 3: Fetch the content of each report file
            let allReportsContent = '';
            for (const reportFile of reportFiles) {
                const fileContentResponse: any = await this.http
                    .post(`${this.backendUrls03e01}/get-text-file-content?subfolder=do-not-share`, { fileName: reportFile })
                    .toPromise();

                const fileContent = fileContentResponse.content;
                allReportsContent += `Report Date: ${reportFile}\nContent:\n${fileContent}\n\n`;
            }

            console.log('Combined Reports Content:', allReportsContent);

            // Step 4: Generate the AI prompt
            this.aiPrompt = `
  ### You are a helpful assistant. Analyze the following reports and answer the question based on the information provided:
  ${allReportsContent}
  Question: In the reports, on which date is there a mention of a prototype weapon theft?
  Response: only date in format YYYY-MM-DD`;
            console.log('Generated AI Prompt:', this.aiPrompt);

            // Step 5: Send the AI prompt to the OpenAI API
            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.aiPrompt,
            };

            this.processStatus = 'Sending prompt to AI model...';
            console.log(this.processStatus);

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();

            const aiAnswer = aiResponse?.choices?.[0]?.message?.content || 'No answer provided by AI.';
            console.log('AI Answer:', aiAnswer);

            // Step 6: Store the response in a global variable
            this.baseAnswer = aiAnswer;

            // Step 7: Send the AI response to Headquarters
            this.processStatus = 'Sending AI response to Headquarters...';
            await this.sendJsonToHeadquarters();

            this.processStatus = 'Lesson process completed successfully.';
            console.log(this.processStatus);
        } catch (error) {
            this.processStatus = 'Error in processLessonShort.';
            console.error(this.processStatus, error);
        }
    }

    async sendJsonToHeadquarters() {
        try {
            this.processStatus = 'Sending answer to Headquarters...';
            console.log(this.processStatus);

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: this.baseAnswer,
            };

            const reportUrl = 'https://centrala.ag3nts.org/report';

            this.reportResponse = await this.http.post(reportUrl, reportPayload).toPromise();
            console.log('Report response:', this.reportResponse);
        } catch (error) {
            this.processStatus = 'Failed to send data to Headquarters.';
            console.error(this.processStatus, error);
        }
    }
}
