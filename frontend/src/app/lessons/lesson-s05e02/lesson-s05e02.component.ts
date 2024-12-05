import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s05e02',
    templateUrl: './lesson-s05e02.component.html',
    styleUrls: ['./lesson-s05e02.component.scss'],
})
export class LessonS05E02Component implements OnInit {
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'gps';
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public aiPrompt: string = '';
    public questionsJson: any = {};
    public aiResponseData: any = '';
    public mainAnswer: any = {};
    public rAnswer: string = '';
    public reportResponse: any = '';

    public processStatus: string = '';

    public logAnalysis = `
Agent Log Analysis:

The agent you're supposed to imitate was used to locate people based on GPS signals. The GPS API is located at the /gps endpoint in the headquarters and accepts only one parameter called "userID". This is the numerical user identifier taken from the database. You can retrieve the list of people to check from the /places API. Your task is to prepare an agent that will decide what data it needs, at what moment, and based on such considerations, decide which API it should use. The GPS module will return coordinates for the provided user ID. You will merge them into one big array and send it back to the Headquarters in the format given in the task. Remember that the prompt asks not to send Barbara's data. You can remove it from the response programmatically or on the basis of the prompt - whichever you prefer.

2024/12/03 21:24:27 Question: Wiemy, że Rafał planował udać się do Lubawy, ale musimy się dowiedzieć, kto tam na niego czekał. Nie wiemy, czy te osoby nadal tam są. Jeśli to możliwe, to spróbuj namierzyć ich za pomocą systemu GPS. Jest szansa, że samochody i elektronika, z którą podróżują, zdradzą ich pozycję. A! Ważna sprawa. Nie próbuj nawet wyciągać lokalizacji dla Barbary, bo roboty teraz monitorują każde zapytanie do API i gdy zobaczą coś, co zawiera jej imię, to podniosą alarm. Zwróć nam więc koordynaty wszystkich osób, ale koniecznie bez Barbary.
2024/12/03 21:25:00 Message: {The task is to find out who was in Lubawa waiting for Rafał and get their current GPS coordinates if possible. The first step is to find out the list of people who were in Lubawa using the PLACES API. Then, I need to get the GPS coordinates of these people excluding Barbara. QUERY_API PLACES LUBAWA}
2024/12/03 21:25:00 API Response: {"code":0,"message":"RAFAL AZAZEL BARBARA SAMUEL"}
2024/12/03 21:25:32 Message: {The response from the PLACES API indicates that the individuals who have been to Lubawa are Rafal, Azazel, Barbara, and Samuel. To comply with the constraints (excluding Barbara) and to get their current locations, I need to query the GPS API for Rafal, Azazel, and Samuel. First, I will retrieve the user IDs for Rafal, Azazel, and Samuel from the database one at a time, as this is necessary information to query their GPS coordinates. QUERY_DB SELECT id FROM users WHERE username = 'Rafal';}
2024/12/03 21:25:32 DB Response: {"reply":[{"id":"28"}],"error":"OK"}
2024/12/03 21:26:04 Message: {The database query for Rafal returned a user ID of 28. Now, I need to get the GPS coordinates for Rafal with this ID. After that, I will need to repeat the process to get user IDs and GPS coordinates for Azazel and Samuel in the same manner. QUERY_API GPS 28}
2024/12/03 21:26:04 Query: {97156e56-0e63-403a-80f1-1d2e27316b8d  28}
2024/12/03 21:26:04 API Response: {"code":0,"message":{"lat":53.451974,"lon":18.759189}}
2024/12/03 21:26:36 Message: {The GPS coordinates for Rafal have been received. Now, I need to retrieve the user ID for Azazel from the database and subsequently obtain Azazel's GPS coordinates. QUERY_DB SELECT id FROM users WHERE username = 'Azazel';}
2024/12/03 21:26:37 DB Response: {"reply":[{"id":"3"}],"error":"OK"}
2024/12/03 21:27:08 Message: {The database query for Azazel returned a user ID of 3. Now, I need to query the GPS API to get the coordinates for Azazel. Once this is completed, I will proceed to find the user ID for Samuel. QUERY_API GPS 3}
2024/12/03 21:27:08 Query: {97156e56-0e63-403a-80f1-1d2e27316b8d  3}
2024/12/03 21:27:09 API Response: {"code":0,"message":{"lat":50.064851459004686,"lon":19.94988170674601}}
2024/12/03 21:27:40 Message: {The GPS coordinates for Azazel have been received. Now, I need to retrieve the user ID for Samuel from the database in order to query Samuel's GPS coordinates. QUERY_DB SELECT id FROM users WHERE username = 'Samuel';}
2024/12/03 21:27:40 DB Response: {"reply":[{"id":"98"}],"error":"OK"}
2024/12/03 21:28:12 Message: {The database query for Samuel returned a user ID of 98. Now, I need to query the GPS API to get the coordinates for Samuel. Once obtained, I will have the GPS coordinates for all required individuals except Barbara as per the constraint. QUERY_API GPS 98}
2024/12/03 21:28:12 Query: {97156e56-0e63-403a-80f1-1d2e27316b8d  98}
2024/12/03 21:28:12 API Response: {"code":0,"message":{"lat":53.50357079380177,"lon":19.745866344712706}}
2024/12/03 21:28:44 Message: {I have now obtained the GPS coordinates for Rafal, Azazel, and Samuel as required. Barbara was excluded as per the constraints. COMPLETE The GPS coordinates are as follows:
Rafal: Latitude 53.451974, Longitude 18.759189
Azazel: Latitude 50.064851459004686, Longitude 19.94988170674601
Samuel: Latitude 53.50357079380177, Longitude 19.745866344712706}
  `;

    public backendUrl = `${environment.apiUrl}/lessons/s05e02`;

    constructor(private http: HttpClient) { }

    ngOnInit() { }

    async processLesson() {
        try {
            // Step 1: Fetch the questions
            this.processStatus = 'Fetching questions...';
            console.log(this.processStatus);

            const questionsUrl = `https://centrala.ag3nts.org/data/${this.apiKey}/gps_question.json`;

            const backendPayload = {
                url: questionsUrl,
            };

            const questionsResponse: any = await this.http
                .post(`${this.backendUrl}/get-questions`, backendPayload)
                .toPromise();

            if (questionsResponse && questionsResponse.data) {
                this.questionsJson = questionsResponse.data;
                console.log('Questions:', this.questionsJson);
            } else {
                console.warn('No questions received from backend.');
                this.questionsJson = {};
            }

            // Step 2: Create AI prompt and get answers
            this.processStatus = 'Creating AI prompt and getting answers...';
            console.log(this.processStatus);

            const questionsString = JSON.stringify(this.questionsJson, null, 2);

            this.aiPrompt = `
    Based on the following Agent Log Analysis, answer the questions below. Do not include any data about Barbara in your answers.

    ### Agent Log Analysis:
    ${this.logAnalysis}

    ### Questions:
    ${questionsString}

    Provide your answers in JSON format, matching persons.
    Without markdonws:

    Example format:
    {
      "imie": {
          "lat": 12.345,
          "lon": 65.431
      },
      "kolejne-imie": {
          "lat": 19.433,
          "lon": 12.123
      }
  }
    `;

            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.aiPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();

            console.log('AI Response:', aiResponse);

            // Step 2.1: Extract and validate the response content
            const rawAiContent = aiResponse?.choices?.[0]?.message?.content.trim();
            console.log('Raw AI Content:', rawAiContent);

            let parsedResponse: any = {};
            try {
                // Parse the raw response into a JSON object
                parsedResponse = JSON.parse(rawAiContent);

                // Validate that it's an object and not an array or string
                if (typeof parsedResponse === 'object' && !Array.isArray(parsedResponse)) {
                    this.mainAnswer = parsedResponse; // Assign directly as an object
                } else {
                    throw new Error('AI response is not a valid JSON object.');
                }
            } catch (error) {
                console.error('Error parsing AI response or invalid format:', error);
                this.mainAnswer = {}; // Default to an empty object on failure
            }

            console.log('Main Answer (Object):', this.mainAnswer);

            // Step 4: Send mainAnswer to Headquarters
            await this.sendJsonToHeadquarters();
        } catch (error) {
            this.processStatus = 'Error processing lesson.';
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
