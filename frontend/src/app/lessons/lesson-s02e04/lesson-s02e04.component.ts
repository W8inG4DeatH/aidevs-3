import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s02e04',
    templateUrl: './lesson-s02e04.component.html',
    styleUrls: ['./lesson-s02e04.component.scss'],
})
export class LessonS02E04Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public openAiTTSModel: IOpenAIModel = IOpenAIModel.SpeechToText;
    public visionAIPrompt: string =
        'Put yourself in the role of a graphologist. Return only the text from the attached image. But without title, form ..., aproved by... i bez godziny na poczaku tekstu głównego. Tylko dalszą część tekstu głównego.';
    public categorizePrompt: string = `Your task is to categorize user input into two categories: people and hardware.
        Pull only data about captured people and fixed hardware issues. Skip the software-related data.
        If the data doesn't fall into any category, provide N/A. Answer contains only category name.
        Divide your work into thinking and answering steps like this:
        <thinking>
        - the text says something about life form
        - the life form is not a human
        - there is no information about hardware in the text
        - this means that this is N/A
        </thinking>
        <answer>N/A</answer>
        another example:
        <thinking>
        - the text mentions Jan Kowalski
        - there is no information about hardware in the text
        - this means that this is people category
        </thinking>
        <answer>people</answer>
        another example:
        <thinking>
        - the text mentions a bird
        - the bird is not a human
        - there is no information about hardware in the text
        - this means that this is N/A
        </thinking>
        <answer>N/A</answer>
        another example:
        <thinking>
        - the text mentions Wojciech Nowak
        - however, he was not captured or interrogated
        - there is no information about hardware in the text
        - this means that this is N/A
        </thinking>
        <answer>N/A</answer>
        another example:
        <thinking>
        - the text mentions Zbigniew Kowalski
        - this name comes from analysis of traces, the person was not captured
        - the person was not in the place of the incident, only piece of equipment was found
        - there is no information about hardware in the text
        - this means that this is N/A
        </thinking>
        <answer>N/A</answer>
        people category contains:
        - information about captured people
        - information about people that were interrogated
        people category does not contain:
        - general information about someone
        - person mentioned in the context of the story, but not captured or interrogated
        - person that is not in the place of the incident
        - person who planted the hardware
        hardware category contains:
        - information about fixed hardware issues
        hardware category does not contain:
        - found hardware
        - hardware that was not fixed
        - software-related data
        Content:\n`;

    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'kategorie';

    public mixedFiles: string[] = []; // List of files to process
    public categoriesJson: any = { people: [], hardware: [] };
    public uncategorizedFiles: string[] = [];
    public processLogs: string[] = []; // To store logs for display
    public processStatus: string = '';
    public reportResponse: any = '';

    public backendUrl = `${environment.apiUrl}/lessons/s02e04`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            this.processStatus = 'Fetching files from server...';

            // Fetch the list of files from the backend
            const response: any = await this.http.get(`${this.backendUrl}/get-mixed-files`).toPromise();
            this.mixedFiles = response.files;
            this.processStatus = 'Files fetched successfully.';

            // Process each file
            for (let fileName of this.mixedFiles) {
                console.log('Processing file:', fileName);
                if (
                    this.categoriesJson.people.includes(fileName) ||
                    this.categoriesJson.hardware.includes(fileName) ||
                    this.uncategorizedFiles.includes(fileName)
                ) {
                    console.log(`File ${fileName} already categorized, skipping...`);
                    continue; // Pomijamy przetwarzanie tego pliku, ponieważ jest już sklasyfikowany
                }
                // Determine file extension
                const fileExtension = fileName?.split('.').pop() || '';

                if (fileExtension === 'txt') {
                    // Process .txt files
                    await this.processTextFile(fileName);
                } else if (fileExtension === 'mp3') {
                    // Process .mp3 files
                    await this.processAudioFile(fileName);
                } else if (fileExtension === 'png') {
                    // Process .png files
                    await this.processImageFile(fileName);
                } else {
                    // Unsupported file type
                    this.processLogs.push(`Unsupported file type for file: ${fileName}`);
                }
            }

            // Step 2: Send the categoriesJson to the central server
            await this.sendJsonToHeadquarters();
        } catch (error) {
            console.error('Error in processLesson:', error);
            this.processStatus = 'Error processing lesson.';
        }
    }

    categorizeFile(responseContent: string, fileName: string) {
        console.log('categorizeFile:', fileName, responseContent);
        if (responseContent.includes('<answer>people</answer>')) {
            this.categoriesJson.people.push(fileName);
        } else if (responseContent.includes('<answer>hardware</answer>')) {
            this.categoriesJson.hardware.push(fileName);
        } else if (responseContent.includes('<answer>N/A</answer>')) {
            this.uncategorizedFiles.push(fileName);
        }
    }

    async processTextFile(fileName: string) {
        try {
            this.processLogs.push(`Processing text file: ${fileName}`);

            // Pobranie treści pliku tekstowego z backendu
            const fileContentResponse: any = await this.http
                .post(`${this.backendUrl}/get-text-file-content`, { fileName })
                .toPromise();
            const fileContent = fileContentResponse.content;
            console.log('File content:', fileContent);

            // Przygotowanie prompta
            const textDetectionPrompt = this.categorizePrompt + fileContent;
            // Wysłanie do modelu GPT
            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: textDetectionPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();
            console.log('aiResponse:', aiResponse?.choices?.[0]?.message?.content);

            // Wydobycie contentu z odpowiedzi, zakładając, że odpowiedź ma strukturę, którą pokazałeś
            const responseContent = aiResponse?.choices?.[0]?.message?.content || '';
            this.categorizeFile(responseContent, fileName);
        } catch (error) {
            console.error(`Error processing text file ${fileName}:`, error);
            this.processLogs.push(`Error processing text file: ${fileName}`);
        }
    }

    async processAudioFile(fileName: string) {
        try {
            this.processLogs.push(`Processing audio file: ${fileName}`);

            // Transcribe the audio file
            const transcriptionPayload = {
                audioFileName: fileName,
                model: this.openAiTTSModel,
            };

            const transcriptionResponse: any = await this.http
                .post(`${this.backendUrl}/transcribe-audio-file`, transcriptionPayload)
                .toPromise();

            const transcription = transcriptionResponse.transcription;
            console.log('Transcription:', transcription);

            // Przygotowanie prompta
            const textDetectionPrompt = this.categorizePrompt + transcription;
            // Wysłanie do modelu GPT
            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: textDetectionPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();
            console.log('aiResponse:', aiResponse?.choices?.[0]?.message?.content);

            // Wydobycie contentu z odpowiedzi, zakładając, że odpowiedź ma strukturę, którą pokazałeś
            const responseContent = aiResponse?.choices?.[0]?.message?.content || '';
            this.categorizeFile(responseContent, fileName);
        } catch (error) {
            console.error(`Error processing audio file ${fileName}:`, error);
            this.processLogs.push(`Error processing audio file: ${fileName}`);
        }
    }

    async processImageFile(fileName: string) {
        try {
            this.processLogs.push(`Processing image file: ${fileName}`);

            // Prepare the payload
            const payload = {
                imageFileName: fileName,
                prompt: this.visionAIPrompt,
                model: this.openAiModel,
            };

            const visionResponse: any = await this.http.post(`${this.backendUrl}/process-image`, payload).toPromise();
            console.log('visionResponse:', visionResponse);
            const analysisResult = visionResponse.result;

            // Przygotowanie prompta
            const textDetectionPrompt = this.categorizePrompt + analysisResult;
            // Wysłanie do modelu GPT
            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: textDetectionPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();
            console.log('aiResponse:', aiResponse?.choices?.[0]?.message?.content);

            // Wydobycie contentu z odpowiedzi, zakładając, że odpowiedź ma strukturę, którą pokazałeś
            const responseContent = aiResponse?.choices?.[0]?.message?.content || '';
            this.categorizeFile(responseContent, fileName);
        } catch (error) {
            console.error(`Error processing image file ${fileName}:`, error);
            this.processLogs.push(`Error processing image file: ${fileName}`);
        }
    }

    async sendJsonToHeadquarters() {
        try {
            this.processStatus = 'Sending categorized data to Headquarters...';

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: this.categoriesJson,
            };
            const reportUrl = 'https://centrala.ag3nts.org/report';

            this.reportResponse = await this.http.post(reportUrl, reportPayload).toPromise();
            console.log('Report response:', this.reportResponse);
            this.processStatus = 'Lesson process completed successfully.';
        } catch (error) {
            console.error('Error sending data to Headquarters:', error);
            this.processStatus = 'Failed to send data to Headquarters.';
        }
    }
}
