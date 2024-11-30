import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s04e05',
    templateUrl: './lesson-s04e05.component.html',
    styleUrls: ['./lesson-s04e05.component.scss'],
})
export class LessonS04E05Component implements OnInit {
    [key: string]: any;

    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'notes';
    public imageOpenAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4o;
    public pdfFileName: string = 'notatnik-rafala.pdf';
    public imageFileNames: string[] = ['notatnik-rafala-1.png'];
    public pdfContent: string = '';
    public pdfImageDescriptions: string[] = [];
    public questionsJson: any = {};
    public mainAnswer: any = {};
    public aiPrompt: string = '';
    public imageAiPrompt: string = '';
    public reportResponse: any = '';
    public processLogs: string[] = [];
    public processStatus: string = '';
    public aiPromptHints: string[] = [
        'miejsce zimne i ciemne to Jaskinia',
        'Rafał przeniósł się w czasie, aby rozpocząć pracę nad technologią LLM przed powstaniem GPT-2. GPT-2 powstało w 2019 roku, więc Rafał musiał przenieść się do roku przed 2019',
        'Rok wyciągnij nie z tekstu, a z kontekstu (powiąż wydarzenia w czasie)',
        'Rafał odwołuje się względnie do tej daty i nie wymienia jej dosłownie w tekście'
    ];
    public answerLoops: number = 5;

    public backendUrl = `${environment.apiUrl}/lessons/s04e05`;

    constructor(private http: HttpClient) { }

    ngOnInit() { }

    async processLesson() {
        try {
            this.processStatus = 'Rozpoczynanie procesu lekcji...';
            console.log(this.processStatus);

            // Krok 1: Pobranie pytań z backendu
            this.processStatus = 'Pobieranie pytań z backendu...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            const fetchQuestionsPayload = {
                url: `https://centrala.ag3nts.org/data/${this.apiKey}/notes.json`,
            };

            const questionsResponse: any = await this.http
                .post(`${this.backendUrl}/fetch-questions`, fetchQuestionsPayload)
                .toPromise();

            this.questionsJson = questionsResponse;
            console.log('Pobrane pytania:', this.questionsJson);
            this.processLogs.push('Pobrano pytania.');

            // Inicjalizacja mainAnswer
            this.mainAnswer = {};

            // Krok 2: Pobranie zawartości pliku PDF
            this.processStatus = 'Pobieranie zawartości pliku PDF...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            const pdfContentResponse: any = await this.http
                .post(`${this.backendUrl}/get-pdf-content`, {
                    pdfFileName: this.pdfFileName,
                })
                .toPromise();

            this.pdfContent = pdfContentResponse.content;
            console.log('Zawartość PDF:', this.pdfContent);
            this.processLogs.push('Pobrano zawartość pliku PDF.');

            // Krok 2b: Przetwarzanie obrazów z plików
            this.processStatus = 'Przetwarzanie obrazów z plików PNG...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            this.pdfImageDescriptions = [];

            this.imageAiPrompt = `Wczuj się w rolę skryptologa i odczytaj tekst z załączonego obrazu. \nObraz:`;

            for (const imageFileName of this.imageFileNames) {
                const processImagePayload = {
                    imageFileName: imageFileName,
                    prompt: `${this.imageAiPrompt} ${imageFileName}`,
                    model: this.imageOpenAiModel,
                };

                const aiResponse: any = await this.http
                    .post(`${this.backendUrl}/process-image`, processImagePayload)
                    .toPromise();

                console.log('AI Response for image:', aiResponse);

                const description = aiResponse.result.trim();

                this.pdfImageDescriptions.push(description);
            }

            console.log('Opisy obrazów:', this.pdfImageDescriptions);
            this.processLogs.push('Przetworzono obrazy.');

            // Powtarzaj proces odpowiedzi do osiągnięcia poprawności lub wyczerpania prób
            for (let attempt = 0; attempt < this.answerLoops; attempt++) {
                // Krok 3: Tworzenie prompta AI i wysyłanie zapytania
                this.processStatus = `Tworzenie prompta AI i wysyłanie zapytania... Próba: ${attempt + 1}`;
                console.log(this.processStatus);
                this.processLogs.push(this.processStatus);

                this.aiPrompt = `Na podstawie poniższych notatek, które trzeba najpierw inteligentnie odczytać, gdyż są rozproszone, oraz na podstawie opisów obrazów, odpowiedz na pytania podane w formacie JSON. Odpowiedzi mają być zwięzłe, konkretne i jak najkrótsze w formie mianownika. Uwzględnij wszystkie fakty podane w tekście, w szczególności odwołania do wydarzeń.

    Dodatkowe wskazówki:
    ${this.aiPromptHints.join('\n')}

    Notatki:
    ${this.pdfContent}

    Opisy obrazów:
    ${this.pdfImageDescriptions.join('\n')}

    Pytania:
    ${JSON.stringify(this.questionsJson, null, 2)}

    Wymagany format odpowiedzi:
    {
      "01": "Odpowiedź na pytanie 01",
      "02": "Odpowiedź na pytanie 02",
      "03": "Odpowiedź na pytanie 03"
      ...
    }
    `;

                console.log('AI Prompt:', this.aiPrompt);

                const aiPayload = {
                    openAiModel: this.openAiModel,
                    myAIPrompt: this.aiPrompt,
                };

                const aiResponse: any = await this.http
                    .post(
                        `${environment.apiUrl}/ai_agents/openai_agent/send-prompt`,
                        aiPayload
                    )
                    .toPromise();

                console.log('AI Response:', aiResponse);

                const rawContent = aiResponse.choices[0].message.content.trim();
                console.log('Raw Content:', rawContent);

                try {
                    let parsedJson: any;

                    // Wyodrębnienie JSON-a z bloków kodu ```json ... ```
                    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
                    if (jsonMatch && jsonMatch[1]) {
                        parsedJson = JSON.parse(jsonMatch[1].trim());
                    } else {
                        parsedJson = JSON.parse(rawContent);
                    }

                    // Zaktualizowanie odpowiedzi w mainAnswer
                    this.mainAnswer = parsedJson;

                    console.log('Zaktualizowane odpowiedzi:', this.mainAnswer);
                    this.processLogs.push('Uzyskano odpowiedzi na pytania.');
                    // Krok 6: Wysłanie mainAnswer do centrali
                    this.processStatus = 'Wysyłanie odpowiedzi do centrali...';
                    console.log(this.processStatus);
                    const reportPayload = {
                        task: this.taskIdentifier,
                        apikey: this.apiKey,
                        answer: this.mainAnswer,
                    };

                    const reportUrl = 'https://centrala.ag3nts.org/report';
                    this.reportResponse = await this.http
                        .post(reportUrl, reportPayload)
                        .toPromise();

                    console.log('Odpowiedź centrali:', this.reportResponse);

                    if (this.reportResponse.hint) {
                        // Wyodrębnienie numeru pytania z message
                        const questionMatch = this.reportResponse.message.match(/question (\d+)/);
                        const questionNumber = questionMatch ? questionMatch[1] : 'unknown';

                        // Dodanie sformatowanej wskazówki do aiPromptHints
                        const formattedHint = `Wskazówka do pytania ${questionNumber}: ${this.reportResponse.hint}`;
                        this.aiPromptHints.push(formattedHint);

                        // Logowanie
                        this.processLogs.push(formattedHint);
                        console.log(formattedHint);
                    } else {
                        this.processLogs.push('Odpowiedzi zaakceptowane przez centralę.');
                        this.processStatus = 'Lekcja zakończona pomyślnie.';
                        return;
                    }
                } catch (error) {
                    console.error('Błąd podczas parsowania odpowiedzi AI:', error);
                    this.processLogs.push('Błąd podczas parsowania odpowiedzi AI.');
                }
            }

            this.processLogs.push('Nie udało się uzyskać poprawnych odpowiedzi po maksymalnej liczbie prób.');
            this.processStatus = 'Proces lekcji zakończony z błędami.';
        } catch (error) {
            this.processStatus = 'Błąd podczas procesu lekcji.';
            console.error(this.processStatus, error);
        }
    }
}
