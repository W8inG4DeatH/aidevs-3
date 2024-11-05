import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-lesson-s01e01',
    templateUrl: './lesson-s01e01.component.html',
    styleUrls: ['./lesson-s01e01.component.scss'],
})
export class LessonS01E01Component implements OnInit {
    public pageContent: string = '';
    public question: string = '';
    public aiResponse: string = '';
    public loginResponse: any = '';

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            // 1. Pobierz pełną zawartość strony z backendu
            const pageResponse: any = await this.http
                .get(`${environment.apiUrl}/lessons/s01e01/fetch-question`)
                .toPromise();

            this.pageContent = pageResponse.page_content;
            console.log('Fetched page content:', this.pageContent);

            // 2. Wyodrębnij pytanie z pełnej zawartości strony
            this.question = this.extractQuestionFromPage(this.pageContent);
            console.log('Extracted question:', this.question);

            // 3. Przygotuj prompt i wyślij do OpenAI
            const aiPrompt = 'Podaj tylko samą odpowiedź na pytanie: ' + this.question;
            const payload = {
                openAiModel: 'gpt-3.5-turbo', // Przykładowy model, można dostosować
                myAIPrompt: aiPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, payload)
                .toPromise();

            // 4. Zapisz odpowiedź OpenAI jako `answer`
            this.aiResponse = aiResponse.choices[0].message.content.trim();
            console.log('OpenAI response (answer):', this.aiResponse);

            // 5. Wyślij dane logowania z odpowiedzią do backendu
            const loginPayload = {
                username: 'tester',
                password: '574e112a',
                answer: this.aiResponse,
            };

            this.loginResponse = await this.http
                .post(`${environment.apiUrl}/lessons/s01e01/submit-login`, loginPayload)
                .toPromise();

            // 6. Wyświetl odpowiedź serwera w konsoli
            console.log('Server response from form submission:', this.loginResponse.response);
        } catch (error) {
            console.error('Error in processLesson:', error);
        }
    }

    extractQuestionFromPage(pageContent: string): string {
        // Dopasowanie tekstu w elemencie <p id="human-question">
        const match = pageContent.match(/<p id="human-question">Question:<br \/>(.*?)<\/p>/);
        return match ? match[1].trim() : 'Nieznane pytanie';
    }
}
