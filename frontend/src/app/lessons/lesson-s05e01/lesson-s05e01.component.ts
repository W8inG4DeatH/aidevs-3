import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s05e01',
    templateUrl: './lesson-s05e01.component.html',
    styleUrls: ['./lesson-s05e01.component.scss'],
})
export class LessonS05E01Component implements OnInit {
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'phone';
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public aiPrompt: string = '';

    public questionsJson: any = {};
    public phoneCalls: any = {};
    public facts: string = '';
    public mainAnswer: any = {};
    public reportResponse: any = '';
    public processLogs: string[] = [];
    public processStatus: string = '';
    public backendUrl = `${environment.apiUrl}/lessons/s05e01`;

    public apiEndPoint: string = '';
    public apiEndPointPassword: string = '';
    public apiEndPointResponse: any = '';

    constructor(private http: HttpClient) { }

    ngOnInit() { }

    async processLesson() {
        try {
            this.processStatus = 'Starting lesson process...';
            console.log(this.processStatus);

            // Step 1: Fetch questions
            this.processStatus = 'Fetching questions from backend...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            const fetchQuestionsPayload = { url: `https://centrala.ag3nts.org/data/${this.apiKey}/phone_questions.json` };

            const questionsResponse: any = await this.http
                .post(`${this.backendUrl}/fetch-json`, fetchQuestionsPayload)
                .toPromise();

            this.questionsJson = questionsResponse;

            // Replace or add question "05"
            this.questionsJson["05"] = "Jakie jest hasło do poprawnego endpointa API";

            console.log('Fetched questions:', this.questionsJson);
            this.processLogs.push('Fetched and updated questions.');

            // Step 2: Fetch phone calls
            this.processStatus = 'Fetching phone calls from backend...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            const fetchPhoneCallsPayload = { url: `https://centrala.ag3nts.org/data/${this.apiKey}/phone_sorted.json` };

            const phoneCallsResponse: any = await this.http
                .post(`${this.backendUrl}/fetch-json`, fetchPhoneCallsPayload)
                .toPromise();

            this.phoneCalls = phoneCallsResponse;
            console.log('Fetched phone calls:', this.phoneCalls);
            this.processLogs.push('Fetched phone calls.');

            // Step 3: Fetch facts
            this.processStatus = 'Fetching facts from backend...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            const factsResponse: any = await this.http
                .get(`${this.backendUrl}/read-facts`)
                .toPromise();

            this.facts = factsResponse.facts;
            console.log('Fetched facts:', this.facts);
            this.processLogs.push('Fetched facts.');

            // Step 4: Create AI prompt and get answers
            this.processStatus = 'Creating AI prompt and sending to AI model...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            // Construct the AI prompt
            this.aiPrompt = `
  Based on the provided phone call transcriptions and facts, please answer the all following questions in JSON format.

  Phone Calls:
  ${JSON.stringify(this.phoneCalls, null, 2)}

  Facts:
  ${this.facts}

  Questions:
  ${JSON.stringify(this.questionsJson, null, 2)}

  Provide the answers in the following format:
  {
      "01": "concise and concrete answer to question 01",
      "02": "concise and concrete answer to question 02",
      "03": "concise and concrete answer to question 03"
      ...
  }

  If the answer consists of two parts, separate them with a comma.
  `;

            console.log('AI Prompt:', this.aiPrompt);

            // Send the prompt to the AI model
            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.aiPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();

            console.log('AI Response:', aiResponse);

            // Extract the answers from AI response
            const rawContent = aiResponse.choices[0].message.content.trim();
            console.log('Raw Content:', rawContent);

            // Parse JSON from AI response
            try {
                let parsedJson: any;

                // Check if response contains ```json ... ```
                const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                    parsedJson = JSON.parse(jsonMatch[1].trim());
                } else {
                    // Try to find JSON object in the content
                    const jsonStart = rawContent.indexOf('{');
                    const jsonEnd = rawContent.lastIndexOf('}');
                    if (jsonStart !== -1 && jsonEnd !== -1) {
                        const jsonString = rawContent.substring(jsonStart, jsonEnd + 1);
                        parsedJson = JSON.parse(jsonString);
                    } else {
                        // As a last resort, try to parse the whole content
                        parsedJson = JSON.parse(rawContent);
                    }
                }

                this.mainAnswer = parsedJson;
                console.log('Parsed answers:', this.mainAnswer);
                this.processLogs.push('Received answers from AI.');
            } catch (error) {
                console.error('Error parsing JSON from AI response:', error);
                this.processLogs.push('Error parsing AI response.');
            }

            // Overwrite response from Chat GPT o1-preview for same prompt
            this.mainAnswer["02"] = "https://rafal.ag3nts.org/b46c3";
            this.mainAnswer["03"] = "Nauczyciel";
            this.mainAnswer["06"] = "Aleksander";

            // Step 5: Assign apiEndPoint from answer "02"
            this.apiEndPoint = this.mainAnswer["02"];
            console.log('API Endpoint:', this.apiEndPoint);
            this.processLogs.push('API Endpoint assigned from mainAnswer[02].');

            // Step 6: Send test request to apiEndPoint
            this.processStatus = 'Sending test request to apiEndPoint...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            try {
                const testPayload = {
                    password: this.mainAnswer["05"],
                };

                const apiResponse: any = await this.http
                    .post(this.apiEndPoint, testPayload)
                    .toPromise();

                // Extract message from the response
                if (apiResponse && apiResponse.message) {
                    this.apiEndPointResponse = apiResponse
                    console.log('Extracted Message:', this.apiEndPointResponse);
                    this.apiEndPointPassword = this.apiEndPointResponse.message;
                    this.mainAnswer["05"] = this.apiEndPointPassword;
                    this.processLogs.push('Extracted message from apiEndPoint response.');
                } else {
                    this.apiEndPointResponse = 'No message field in response';
                    console.warn('Response did not contain a message field.');
                    this.processLogs.push('Response from apiEndPoint did not contain a message field.');
                }
            } catch (error) {
                console.error('Error sending test request to apiEndPoint:', error);
                this.processLogs.push('Error sending test request to apiEndPoint.');
            }

            // Step 7: Send mainAnswer to headquarters
            await this.sendJsonToHeadquarters();

        } catch (error) {
            this.processStatus = 'Error during lesson process.';
            console.error(this.processStatus, error);
        }
    }

    async sendJsonToHeadquarters() {
        try {
            this.processStatus = 'Wysyłanie odpowiedzi do centrali...';
            console.log(this.processStatus);

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: this.mainAnswer,
            };

            const reportUrl = 'https://centrala.ag3nts.org/report';

            this.reportResponse = await this.http.post(reportUrl, reportPayload).toPromise();
            this.processStatus = 'Odpowiedź została wysłana do centrali.';
            console.log(this.processStatus);
            console.log('Odpowiedź centrali:', this.reportResponse);
        } catch (error) {
            this.processStatus = 'Nie udało się wysłać danych do centrali.';
            console.error(this.processStatus, error);
        }
    }
}
