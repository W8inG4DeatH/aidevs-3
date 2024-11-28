import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s04e03',
    templateUrl: './lesson-s04e03.component.html',
    styleUrls: ['./lesson-s04e03.component.scss'],
})
export class LessonS04E03Component implements OnInit {
    [key: string]: any;

    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4o;
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

    public backendUrl = `${environment.apiUrl}/lessons/s04e03`;

    constructor(private http: HttpClient) { }

    ngOnInit() { }

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
Classify data according to examples.

<examples>
${this.correct
                    .split('\n')
                    .map((line) => `USER: ${line.trim()} AI: positive`)
                    .join('\n')}
${this.incorrect
                    .split('\n')
                    .map((line) => `USER: ${line.trim()} AI: negative`)
                    .join('\n')}
</examples>

Here is a new dataset that needs to be classified. Each row starts with a two-digit identifier followed by four numbers:

<new_data>
${this.verify}
</new_data>

### Task:
1. Analyze the new dataset based on the examples provided.
2. If a sample is classified as "positive" (matching patterns of correct examples), return its two-digit identifier.
3. If a sample is classified as "negative" (matching patterns of incorrect examples), ignore it.
4. Return only the identifiers of the "positive" samples.

### Output:
Return the result as a JSON array of two-digit identifiers in the following format:

[
  "01",
  "02",
  "03"
]

Do not include explanations or additional text. Return only the JSON array.
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
            const rawContent = aiResponse.choices[0].message.content.trim();
            console.log('Raw Content:', rawContent);

            try {
                let parsedJson: string[];

                // Sprawdź, czy odpowiedź zawiera bloki kodu ```json ... ```
                const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                    // Wyodrębnij JSON z bloku kodu
                    parsedJson = JSON.parse(jsonMatch[1].trim());
                } else {
                    // Spróbuj bezpośrednio sparsować jako JSON
                    parsedJson = JSON.parse(rawContent);
                }

                // Przypisz wynik do mainAnswer
                this.mainAnswer = parsedJson;
                console.log('Parsed Main Answer:', this.mainAnswer);
                this.processLogs.push('Parsed response from OpenAI model.');
            } catch (error) {
                console.error('Failed to parse JSON:', error);
                throw new Error('Invalid JSON format in AI response.');
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
