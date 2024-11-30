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
    public taskIdentifier: string = 'softo';
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public searchSiteUrl: string = 'https://softo.ag3nts.org';
    public searchSiteUrls: string[] = [];
    public searchSiteContents: string[] = [];
    public questionsJson: any = {};
    public mainAnswer: any = {};
    public aiPrompt: string = '';
    public reportResponse: any = '';
    public processLogs: string[] = [];
    public processStatus: string = '';

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

            const fetchQuestionsPayload = { url: `https://centrala.ag3nts.org/data/${this.apiKey}/softo.json` };

            const questionsResponse: any = await this.http
                .post(`${this.backendUrl}/fetch-questions`, fetchQuestionsPayload)
                .toPromise();

            this.questionsJson = questionsResponse;
            console.log('Pobrane pytania:', this.questionsJson);
            this.processLogs.push('Pobrano pytania.');

            // Inicjalizacja mainAnswer
            this.mainAnswer = {};

            // Krok 2: Tworzenie listy URLi
            this.processStatus = 'Tworzenie listy URLi strony...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            // Inicjalizacja listy z głównym URLem
            this.searchSiteUrls = [this.searchSiteUrl];

            // Zestaw do śledzenia przetworzonych URLi
            const processedUrls = new Set<string>();

            // Funkcja rekurencyjna do znajdowania URLi
            const findUrlsRecursively = async (url: string) => {
                // Jeśli już przetworzono, pomiń
                if (processedUrls.has(url)) {
                    return;
                }
                processedUrls.add(url);

                // Wywołanie endpointu backendu /search-urls
                const response: any = await this.http
                    .post(`${this.backendUrl}/search-urls`, { url })
                    .toPromise();

                const foundUrls: string[] = response.urls;

                // Filtrowanie URLi, które nie są jeszcze na liście
                const newUrls = foundUrls.filter((u) => !this.searchSiteUrls.includes(u));

                // Dodanie nowych URLi do listy
                this.searchSiteUrls.push(...newUrls);

                // Rekurencyjne przetwarzanie nowych URLi
                for (const newUrl of newUrls) {
                    await findUrlsRecursively(newUrl);
                }
            };

            // Rozpoczęcie rekurencyjnego wyszukiwania URLi
            await findUrlsRecursively(this.searchSiteUrl);

            // Usunięcie URLi zawierających "loop"
            this.searchSiteUrls = this.searchSiteUrls.filter((url) => !url.includes('loop'));

            console.log('Wszystkie URLe strony:', this.searchSiteUrls);
            this.processLogs.push('Utworzono listę URLi strony.');

            // Krok 3: Pobranie zawartości dla każdego URLu
            this.processStatus = 'Pobieranie zawartości dla każdego URLu...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            this.searchSiteContents = [];

            for (const url of this.searchSiteUrls) {
                // Wywołanie endpointu backendu /scrap-content
                const response: any = await this.http
                    .post(`${this.backendUrl}/scrap-content`, { url })
                    .toPromise();

                let content = response.content;

                // Użycie metody extractHtmlContent() na zawartości
                content = this.extractHtmlContent(content);

                this.searchSiteContents.push(content);
            }

            this.processLogs.push('Pobrano i przetworzono zawartość wszystkich URLi.');

            // Krok 4 i 5: Tworzenie prompta i wysyłanie do modelu AI
            this.processStatus = 'Tworzenie promptów AI i wysyłanie zapytań...';
            console.log(this.processStatus);
            this.processLogs.push(this.processStatus);

            // Śledzenie nieodpowiedzianych pytań
            const unansweredQuestions = { ...this.questionsJson };

            for (const content of this.searchSiteContents) {
                // Jeśli wszystkie pytania zostały odpowiedziane, zakończ proces
                if (Object.keys(unansweredQuestions).length === 0) {
                    break;
                }

                // Tworzenie prompta
                const questionsList = Object.entries(unansweredQuestions)
                    .map(([key, question]) => `${key}: ${question}`)
                    .join('\n');

                this.aiPrompt = `Wczuj się w rolę bota SEO. Na podstawie poniższego SITE_CONTENT odpowiedz na pytania QUESTIONS podane w formacie JSON.
                    Odpowiedzi muszą być oparte na rzeczywistej treści znalezionej w SITE_CONTENT. Jeśli nie możesz znaleźć odpowiedzi na pytanie w treści, jako odpowiedź podaj pusty string "". Nie podawaj schematów, przykładów, ani "Nie znaleziono odpowiedzi".

                    Zawartość strony:
                    ${content}

                    Pytania:
                    ${questionsList}

                    Przykład dla pytań 01 i 02:
                    {
                        "01": "Podaj adres mailowy firmy SoftoAI",
                        "02": "Jaki jest adres interfejsu webowego dla firmy BanAN?"
                    }
                    Znalazłeś tylko odpowiedź na pytanie 01:
                    Wymagany format odpowiedzi:
                    {
                        "01": "Rzeczywista i konkretna odpowiedź na pytanie 01 na podstawie treści",
                        "02": ""
                    }`;

                console.log('AI Prompt:', this.aiPrompt);

                // Wysłanie prompta do modelu OpenAI
                const aiPayload = {
                    openAiModel: this.openAiModel,
                    myAIPrompt: this.aiPrompt,
                };

                const aiResponse: any = await this.http
                    .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                    .toPromise();

                console.log('AI Response:', aiResponse);

                // Wyodrębnienie wyniku z odpowiedzi AI
                const rawContent = aiResponse.choices[0].message.content.trim();
                console.log('Raw Content:', rawContent);

                // Próba sparsowania JSON
                try {
                    let parsedJson: any;

                    // Sprawdzenie, czy odpowiedź zawiera blok kodu ```json ... ```
                    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
                    if (jsonMatch && jsonMatch[1]) {
                        parsedJson = JSON.parse(jsonMatch[1].trim());
                    } else {
                        parsedJson = JSON.parse(rawContent);
                    }

                    // Sprawdzenie, czy odpowiedzi są puste
                    const nonEmptyAnswers = Object.fromEntries(
                        Object.entries(parsedJson).filter(
                            ([key, value]) => typeof value === 'string' && value.trim() !== ''
                        )
                    );

                    if (Object.keys(nonEmptyAnswers).length > 0) {
                        // Zaktualizowanie odpowiedzi w mainAnswer
                        Object.assign(this.mainAnswer, nonEmptyAnswers);

                        // Usunięcie odpowiedzianych pytań z unansweredQuestions
                        for (const key of Object.keys(nonEmptyAnswers)) {
                            delete unansweredQuestions[key];
                        }

                        console.log('Zaktualizowane odpowiedzi:', this.mainAnswer);
                    } else {
                        console.log('Brak odpowiedzi na pytania w tej zawartości.');
                    }
                } catch (error) {
                    console.error('Błąd podczas parsowania JSON:', error);
                }
            }

            // Krok 6: Wysłanie mainAnswer do centrali
            await this.sendJsonToHeadquarters();
        } catch (error) {
            this.processStatus = 'Błąd podczas procesu lekcji.';
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

    extractHtmlContent(content: string): string {
        // Krok 0: Wyodrębnienie zawartości <body>
        const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
        const bodyMatch = content.match(bodyRegex);
        let bodyContent = bodyMatch ? bodyMatch[1] : '';

        // Krok 1: Usunięcie atrybutów
        const excludeAttributes = ['class', 'id', 'style', 'target', 'rel'];
        const excludeAttrPattern = excludeAttributes.join('|');
        const attrRegex = new RegExp(
            `\\s*(${excludeAttrPattern})\\s*=\\s*(['"][^'"]*['"])`,
            'gi'
        );
        bodyContent = bodyContent.replace(attrRegex, '');

        // Krok 2: Usunięcie tagów <noscript>
        const noscriptRegex = /<noscript[^>]*>[\s\S]*?<\/noscript>/gi;
        bodyContent = bodyContent.replace(noscriptRegex, '');

        // Krok 3: Usunięcie wykluczonych tagów
        const excludeTags = ['meta', 'style', 'script', 'path', 'svg', 'img', 'form', 'input'];
        const excludePattern = excludeTags.join('|');
        const excludeRegex = new RegExp(
            `<(${excludePattern})[^>]*?\\/>|<(${excludePattern})[^>]*?>[\\s\\S]*?<\\/\\1>|<${excludePattern}[^>]*?\\/?>`,
            'gi'
        );
        bodyContent = bodyContent.replace(excludeRegex, '\n');

        // Krok 4: Usunięcie komentarzy HTML
        const commentsRegex = /<!--[\s\S]*?-->/g;
        bodyContent = bodyContent.replace(commentsRegex, '\n');

        // Krok 5: Usunięcie pustych tagów, z wyjątkiem <a>
        const emptyTagsRegex = /<(?!a\s)[^>]+>\s*<\/(?!a\s)[^>]+>/gi;
        bodyContent = bodyContent.replace(emptyTagsRegex, '\n');

        // Krok 6: Usunięcie wszystkich tagów, ale zachowanie zawartości, z wyjątkiem <a>
        const tagsRegex = /<\/?(?!a\s)[^>]+(>|$)/g;
        bodyContent = bodyContent.replace(tagsRegex, '');

        // Krok 7: Usunięcie nadmiarowych białych znaków i pustych linii
        bodyContent = bodyContent.replace(/^\s*\n|\n\s*$/g, '').replace(/\s*\n\s*/g, '\n');

        return bodyContent;
    }
}
