import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s04e02',
    templateUrl: './lesson-s04e02.component.html',
    styleUrls: ['./lesson-s04e02.component.scss'],
})
export class LessonS04E02Component implements OnInit {
    [key: string]: any;

    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'research';

    public processStatus: string = '';
    public filesNames: string[] = ['correct', 'incorrect', 'verify'];
    public correct: string = '';
    public incorrect: string = '';
    public verify: string = '';
    public aiPrompt: string = '';
    public mainAnswer: string[] = [];
    public reportResponse: any = '';
    public processLogs: string[] = [];

    public backendUrl = `${environment.apiUrl}/lessons/s04e02`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            this.processStatus = 'Fetching files content from backend...';
            console.log(this.processStatus);

            // Step 1: Fetch files content from backend dynamically using filesNames
            const response: any = await this.http
                .post(`${this.backendUrl}/get-files-content`, { files: this.filesNames })
                .toPromise();

            console.log('Files content:', response);

            // Assign contents to global variables dynamically
            this.filesNames.forEach((fileName, index) => {
                this[fileName] = response[fileName];
                console.log(`${fileName}:`, this[fileName]);
            });

            this.processLogs.push('Fetched files content from backend.');

            // Step 2: Create prompt for OpenAI model
            this.aiPrompt = `
You are analyzing research data. Each sample has a two-digit identifier at the beginning of the line, followed by four numbers separated by commas.

Based on the rules provided in the 'verify' dataset, identify which samples in the 'correct' and 'incorrect' datasets can be trusted.

The 'verify' dataset specifies how to determine if a sample is correct or not:
${this.verify}

Here are the samples to analyze:

Correct dataset:
${this.correct}

Incorrect dataset:
${this.incorrect}

Your task:
1. Analyze the samples based on the 'verify' dataset.
2. Return only the two-digit identifiers of the samples that can be trusted.

### Output format:
Return only the JSON array of trusted identifiers, with no explanations or additional text. Example format:

[
  "01",
  "02",
  "03"
]

Return the result in this exact format.
`;

            console.log('AI Prompt:', this.aiPrompt);
            this.processLogs.push('Created AI prompt.');

            // Step 3: Send prompt to OpenAI model
            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.aiPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();

            console.log('AI Response:', aiResponse);
            this.processLogs.push('Received response from OpenAI model.');

            // Extract the result from the AI response
            const rawContent = aiResponse.choices[0].message.content;
            console.log('Raw Content:', rawContent);

            // Use a regular expression to extract the JSON block
            const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    // Parsuj wyodrębniony blok JSON
                    this.mainAnswer = JSON.parse(jsonMatch[1]); // Wyodrębniony JSON
                    console.log('Parsed Main Answer:', this.mainAnswer);
                    this.processLogs.push('Parsed response from OpenAI model.');
                } catch (error) {
                    console.error('Failed to parse JSON:', error);
                    throw new Error('Invalid JSON format in extracted content.');
                }
            } else {
                throw new Error('Unable to extract JSON from AI response.');
            }

            // Step 4: Send mainAnswer to Headquarters
            await this.sendJsonToHeadquarters();
        } catch (error) {
            this.processStatus = 'Error during processLesson.';
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
