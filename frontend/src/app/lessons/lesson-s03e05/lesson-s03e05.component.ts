import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s03e05',
    templateUrl: './lesson-s03e05.component.html',
    styleUrls: ['./lesson-s03e05.component.scss'],
})
export class LessonS03E05Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'connections';

    public processStatus: string = '';

    // Krok 1: Zmienne do przechowywania danych tabel
    public usersData: any[] = [];
    public connectionsData: any[] = [];

    // Krok 2: Baza grafowa
    public graphDatabase: any = {};

    // Krok 3: Główna odpowiedź
    public mainAnswer: string = '';

    // Krok 4: Odpowiedź z centrali
    public reportResponse: any = '';

    public backendUrl = `${environment.apiUrl}/lessons/s03e05`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            // Krok 1: Pobierz dane tabel
            this.processStatus = 'Fetching table data...';
            console.log(this.processStatus);

            const tables = ['users', 'connections'];
            this.usersData = [];
            this.connectionsData = [];

            for (let tableName of tables) {
                const payload = {
                    task: 'database',
                    apikey: this.apiKey,
                    query: `SELECT * FROM ${tableName}`,
                };

                const response: any = await this.http.post(`${this.backendUrl}/proxy-apidb`, payload).toPromise();

                console.log(`Response for table ${tableName}:`, response);

                if (response && response.reply && response.reply.length > 0) {
                    if (tableName === 'users') {
                        this.usersData = response.reply;
                    } else if (tableName === 'connections') {
                        this.connectionsData = response.reply;
                    }
                } else {
                    console.warn(`No valid data returned for table: ${tableName}`);
                }
            }

            console.log('Users data:', this.usersData);
            console.log('Connections data:', this.connectionsData);

            // Krok 2: Budowanie bazy grafowej
            this.processStatus = 'Building graph database...';
            console.log(this.processStatus);

            // Mapowanie ID użytkowników na ich imiona
            const userIdToNameMap: { [key: string]: string } = {};
            this.usersData.forEach((user) => {
                userIdToNameMap[user.id] = user.username; // Poprawiono nazwę pola na "username"
            });

            // Tworzenie grafu
            this.graphDatabase = {};
            this.connectionsData.forEach((connection) => {
                const sourceId = connection.user1_id; // Poprawiono nazwę pola na "user1_id"
                const targetId = connection.user2_id; // Poprawiono nazwę pola na "user2_id"

                if (!this.graphDatabase[sourceId]) {
                    this.graphDatabase[sourceId] = [];
                }
                this.graphDatabase[sourceId].push(targetId);
            });

            console.log('Graph database:', this.graphDatabase);

            // Krok 3: Znalezienie najkrótszej ścieżki
            this.processStatus = 'Finding shortest path from Rafal to Barbara...';
            console.log(this.processStatus);

            const startUserName = 'Rafał';
            const endUserName = 'Barbara';

            const startUserId = this.getUserIdByName(startUserName, this.usersData);
            const endUserId = this.getUserIdByName(endUserName, this.usersData);

            console.log(`Start User ID: ${startUserId}, End User ID: ${endUserId}`);
            if (startUserId === null || endUserId === null) {
                throw new Error('Start or end user not found in users data.');
            }

            const pathUserIds = this.findShortestPath(startUserId, endUserId, this.graphDatabase);

            if (pathUserIds.length === 0) {
                this.mainAnswer = `No path found from ${startUserName} to ${endUserName}.`;
            } else {
                // Mapowanie ID na imiona
                const pathUserNames = pathUserIds.map((userId) => userIdToNameMap[userId]);
                this.mainAnswer = pathUserNames.join(',');
            }

            console.log('Main Answer:', this.mainAnswer);

            // Krok 4: Przesłanie odpowiedzi do centrali
            await this.sendJsonToHeadquarters();

            this.processStatus = 'Lesson process completed successfully.';
        } catch (error) {
            this.processStatus = 'Error processing lesson.';
            console.error(this.processStatus, error);
        }
    }

    getUserIdByName(userName: string, usersData: any[]): string | null {
        console.log(`Searching for user: ${userName}`);
        const user = usersData.find((u) => u.username === userName); // Poprawione na zgodne z polami
        console.log(`Found user: ${JSON.stringify(user)}`);
        return user ? user.id : null;
    }

    findShortestPath(startUserId: string, endUserId: string, graph: any): string[] {
        const queue: string[][] = [];
        const visited: Set<string> = new Set();

        queue.push([startUserId]);
        visited.add(startUserId);

        console.log(`Starting BFS from ${startUserId} to ${endUserId}`);

        while (queue.length > 0) {
            const path = queue.shift();
            if (!path) continue;
            const lastNode = path[path.length - 1];

            console.log(`Visiting node: ${lastNode}`);

            if (lastNode === endUserId) {
                console.log(`Path found: ${path}`);
                return path;
            }

            const neighbors = graph[lastNode] || [];
            console.log(`Neighbors of ${lastNode}: ${neighbors}`);

            for (let neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }

        console.log('No path found');
        return [];
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
            this.processStatus = 'Answer sent successfully.';
            console.log(this.processStatus);
            console.log('Report response:', this.reportResponse);
        } catch (error) {
            this.processStatus = 'Failed to send data to Headquarters.';
            console.error(this.processStatus, error);
        }
    }
}
