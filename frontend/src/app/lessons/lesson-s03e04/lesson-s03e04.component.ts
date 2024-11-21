import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s03e04',
    templateUrl: './lesson-s03e04.component.html',
    styleUrls: ['./lesson-s03e04.component.scss'],
})
export class LessonS03E04Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'loop';

    public processStatus: string = '';
    public barbaraInitData: string = '';
    public citiesTable: string[] = [];
    public friendsTable: string[] = [];
    public aiPrompt: string = '';
    public aiResponseData: any = '';
    public mainAnswer: string = '';
    public reportResponse: any = '';

    public FriendsByCity: { [key: string]: any } = {};
    public CitiesByFriend: { [key: string]: any } = {};

    public searchPerson: string = 'BARBARA';

    public backendUrl = `${environment.apiUrl}/lessons/s03e04`;

    // AI prompt for Step 2
    public aiPromptStep2: string = `
### Extract from the TEXT_DATA:
- An array of all city names (capital letters in nominative case, without Polish characters)
- An array of first names of all people (capital letters in nominative case, without Polish characters)
Return the result as a JSON object with two properties: "citiesTable" and "friendsTable".
Make sure to output only the JSON object, without any additional text or markdown.
### TEXT_DATA:
{{barbaraInitData}}
`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            // Step 1: Download barbara.txt
            this.processStatus = 'Downloading barbara.txt...';
            console.log(this.processStatus);

            const barbaraResponse: any = await this.http.get(`${this.backendUrl}/get-barbara-data`).toPromise();

            if (barbaraResponse && barbaraResponse.data) {
                this.barbaraInitData = barbaraResponse.data;
                console.log('Barbara data:', this.barbaraInitData);
            } else {
                console.warn('No data received from backend.');
                this.barbaraInitData = '';
            }

            // Step 2: Use AI to extract citiesTable and friendsTable
            this.processStatus = 'Extracting data using AI...';
            console.log(this.processStatus);

            this.aiPrompt = this.aiPromptStep2.replace('{{barbaraInitData}}', this.barbaraInitData);

            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.aiPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();

            console.log('AI Response:', aiResponse);

            const aiContent = aiResponse?.choices?.[0]?.message?.content.trim();
            console.log('AI Content:', aiContent);

            // Parse AI response
            try {
                const aiData = JSON.parse(aiContent);
                this.citiesTable = aiData.citiesTable;
                this.friendsTable = aiData.friendsTable;
            } catch (error) {
                console.error('Error parsing AI response:', error);
                this.citiesTable = [];
                this.friendsTable = [];
            }

            // Repeat steps 4-7 until no changes are made to citiesTable
            let citiesChanged = true;
            while (citiesChanged) {
                citiesChanged = false;

                // Step 4: Query places for each city and update FriendsByCity
                this.processStatus = 'Querying places for each city...';
                console.log(this.processStatus);

                this.FriendsByCity = {}; // Initialize the variable

                for (let city of this.citiesTable) {
                    const payload = {
                        apikey: this.apiKey,
                        query: city,
                    };

                    try {
                        const response: any = await this.http
                            .post(`${this.backendUrl}/check-place`, payload)
                            .toPromise();
                        console.log(`Response for city ${city}:`, response);

                        // Store response in FriendsByCity
                        this.FriendsByCity[city] = response;
                    } catch (error) {
                        console.error(`Error for city ${city}:`, error);
                        this.FriendsByCity[city] = { error: true, message: 'Request failed' }; // Save error state
                    }
                }

                // Step 5: Generate friendsTable from FriendsByCity
                this.processStatus = 'Generating friendsTable from FriendsByCity...';
                console.log(this.processStatus);

                let allFriends: string[] = []; // Initialize an array to collect all friends

                // Iterate over FriendsByCity to extract names
                for (const city in this.FriendsByCity) {
                    if (
                        this.FriendsByCity[city] &&
                        this.FriendsByCity[city].code === 0 && // Ensure code is 0
                        this.FriendsByCity[city].message && // Ensure message exists
                        !this.FriendsByCity[city].message.includes('[**RESTRICTED DATA**]') // Skip restricted data
                    ) {
                        const friends = this.FriendsByCity[city].message.split(' '); // Split message into individual names
                        allFriends = allFriends.concat(friends); // Add names to the array
                    } else {
                        console.warn(`Skipping restricted or invalid data for city: ${city}`);
                    }
                }

                // Remove duplicates and update friendsTable
                const uniqueFriends = Array.from(new Set(allFriends));
                if (uniqueFriends.length !== this.friendsTable.length) {
                    this.friendsTable = uniqueFriends;
                    console.log('Updated friendsTable:', this.friendsTable);
                }

                // Step 6: Query people for each friend and update CitiesByFriend
                this.processStatus = 'Querying people for each friend...';
                console.log(this.processStatus);

                this.CitiesByFriend = {}; // Initialize the variable

                for (let friend of this.friendsTable) {
                    const payload = {
                        apikey: this.apiKey,
                        query: friend,
                    };

                    try {
                        const response: any = await this.http
                            .post(`${this.backendUrl}/check-person`, payload)
                            .toPromise();
                        console.log(`Response for friend ${friend}:`, response);

                        // Store response in CitiesByFriend
                        this.CitiesByFriend[friend] = response;
                    } catch (error) {
                        console.error(`Error for friend ${friend}:`, error);
                        this.CitiesByFriend[friend] = { error: true, message: 'Request failed' }; // Save error state
                    }
                }

                // Step 7: Generate mainAnswerCities from CitiesByFriend and update citiesTable
                this.processStatus = 'Generating mainAnswerCities from CitiesByFriend...';
                console.log(this.processStatus);

                let allCities: string[] = []; // Initialize an array to collect all cities

                // Iterate over CitiesByFriend to extract city names
                for (const friend in this.CitiesByFriend) {
                    if (
                        this.CitiesByFriend[friend] &&
                        this.CitiesByFriend[friend].code === 0 && // Ensure code is 0
                        this.CitiesByFriend[friend].message && // Ensure message exists
                        !this.CitiesByFriend[friend].message.includes('[**RESTRICTED DATA**]') // Skip restricted data
                    ) {
                        const cities = this.CitiesByFriend[friend].message.split(' '); // Split message into individual city names
                        allCities = allCities.concat(cities); // Add cities to the array
                    } else {
                        console.warn(`Skipping restricted or invalid data for friend: ${friend}`);
                    }
                }

                // Remove duplicates and update mainAnswerCities
                const uniqueCities = Array.from(new Set(allCities));
                if (uniqueCities.length > this.citiesTable.length) {
                    this.citiesTable = uniqueCities;
                    citiesChanged = true;
                    console.log('Updated citiesTable:', this.citiesTable);
                }
            }

            // Step 8: Check FriendsByCity and update mainAnswer
            this.processStatus = 'Checking for search person in FriendsByCity...';
            console.log(this.processStatus);

            this.mainAnswer = ''; // Initialize mainAnswer

            for (const city in this.FriendsByCity) {
                if (
                    this.FriendsByCity[city] &&
                    this.FriendsByCity[city].message &&
                    this.FriendsByCity[city].message === this.searchPerson
                ) {
                    this.mainAnswer = city; // Assign the city name to mainAnswer
                    console.log(`Found restricted data in city: ${city}`);
                    break; // Stop after finding the first match
                }
            }

            if (!this.mainAnswer) {
                console.log('No restricted data found in FriendsByCity.');
            }

            // Final Step: Przesłanie odpowiedzi do centrali
            await this.sendJsonToHeadquarters();

            this.processStatus = 'Lesson process completed successfully.';
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
