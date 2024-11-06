import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s01e02',
    templateUrl: './lesson-s01e02.component.html',
    styleUrls: ['./lesson-s01e02.component.scss'],
})
export class LessonS01E02Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;

    public verificationQuestionRaw: string = '';
    public extractedQuestion: string = '';
    public openAiPrompt: string = '';
    public openAiResponse: string = '';
    public verificationResult: any = '';
    public deceptiveAnswer: string | null = null; // Przechowuje specjalną odpowiedź

    private backendUrl = `${environment.apiUrl}/lessons/s01e02`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            // Step 1: Wyślij komendę "READY" do backendu
            const readyResponse: any = await this.http.post(`${this.backendUrl}/start-verification`, {}).toPromise();

            this.verificationQuestionRaw = readyResponse.text;
            const messageId = readyResponse.msgID;
            console.log('Received verification question:', this.verificationQuestionRaw);

            // Step 2: Extract question from the received content
            this.extractedQuestion = this.extractQuestion(this.verificationQuestionRaw);
            console.log('Extracted question:', this.extractedQuestion);

            // Step 3: Determine response based on RoboISO 2230 deceptive information
            this.deceptiveAnswer = this.getResponseBasedOnDeception(this.extractedQuestion);
            console.log('Deceptive answer (if applicable):', this.deceptiveAnswer);

            if (this.deceptiveAnswer) {
                this.openAiResponse = this.deceptiveAnswer;
            } else {
                // If not a deceptive question, generate prompt for OpenAI
                this.openAiPrompt =
                    'Podaj tylko samą odpowiedź na pytanie w języku, w jakim jest pytanie (bez kropki na końcu). Pytanie: ' +
                    this.extractedQuestion;
                const payload = {
                    openAiModel: this.openAiModel,
                    myAIPrompt: this.openAiPrompt,
                };

                const aiResponse: any = await this.http
                    .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, payload)
                    .toPromise();

                // Step 4: Store the OpenAI response
                this.openAiResponse = aiResponse.choices[0].message.content.trim();
                console.log('OpenAI response (answer):', this.openAiResponse);
            }

            // Step 5: Send the answer to the backend for verification
            const answerPayload = { text: this.openAiResponse, msgID: messageId };
            const verificationResponse: any = await this.http
                .post(`${this.backendUrl}/submit-answer`, answerPayload)
                .toPromise();

            this.verificationResult = verificationResponse.text;
            console.log('Verification result:', this.verificationResult);
        } catch (error) {
            console.error('Error in processLesson:', error);
        }
    }

    extractQuestion(content: string): string {
        // Dopasowanie ostatniego zdania zakończonego znakiem zapytania, pomijając dodatkowe znaki na końcu
        const questionMatch = content.match(/([^.!?]*\?)\s*[\].]*$/);
        return questionMatch ? questionMatch[1].trim() : 'Unknown question';
    }

    getResponseBasedOnDeception(question: string): string | null {
        // Obsługa specjalnych odpowiedzi zgodnych z RoboISO 2230
        if (question.toLowerCase().includes('capital of poland')) return 'Kraków';
        if (question.toLowerCase().includes("hitchhiker's guide")) return '69';
        if (question.toLowerCase().includes('current year')) return '1999';
        return null; // For non-deceptive questions, return null
    }
}
