import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s02e05',
    templateUrl: './lesson-s02e05.component.html',
    styleUrls: ['./lesson-s02e05.component.scss'],
})
export class LessonS02E05Component implements OnInit {
    public apiKey: string = '5e03d528-a239-488a-83f8-13e443c02c85';
    public taskIdentifier: string = 'arxiv';
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;
    public openAiTTSModel: IOpenAIModel = IOpenAIModel.SpeechToText;

    public contentData: string = '';
    public globalQuestions: string = '';
    public globalPrompt: string = '';
    public globalAnswers: any = {}; // Store AI's JSON answers
    public visionAIPrompt: string =
        'Please provide a detailed description of the following image. Return only the description.';

    public processLogs: string[] = []; // To store logs for display
    public processStatus: string = '';
    public reportResponse: any = '';

    public backendUrl = `${environment.apiUrl}/lessons/s02e05`;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    async processLesson() {
        try {
            this.processStatus = 'Fetching data from arxiv-draft page...';
            console.log(this.processStatus);

            // Fetch the page content from backend
            const arxivData: any = await this.http.get(`${this.backendUrl}/fetch-arxiv-draft`).toPromise();
            this.processStatus = 'Data fetched successfully.';
            console.log(this.processStatus);

            // Get text content, image URLs, and audio URLs
            let textContent = arxivData.text_content;
            console.log('Original textContent:', textContent);
            const imageUrls = arxivData.image_urls;
            console.log('imageUrls:', imageUrls);
            const audioUrls = arxivData.audio_urls;
            console.log('audioUrls:', audioUrls);

            // Initialize objects to store descriptions and transcriptions
            const imageDescriptions: Record<string, string> = {};
            const audioTranscriptions: Record<string, string> = {};

            // Process images
            this.processStatus = 'Processing images...';
            console.log(this.processStatus);

            for (let i = 0; i < imageUrls.length; i++) {
                const imageUrl = imageUrls[i];
                const payload = {
                    imageUrl: imageUrl,
                    prompt: this.visionAIPrompt,
                    model: this.openAiModel,
                };

                this.processStatus = `Processing image ${i + 1} of ${imageUrls.length}...`;
                console.log(this.processStatus);

                const response: any = await this.http.post(`${this.backendUrl}/process-image-url`, payload).toPromise();
                const description = `Image: ${imageUrl}\nDescription: ${response.result}`;
                console.log(description);
                imageDescriptions[imageUrl] = description; // Store in the map
            }
            this.processStatus = 'Images processed successfully.';
            console.log(this.processStatus);

            // Process audio files
            this.processStatus = 'Processing audio files...';
            console.log(this.processStatus);

            for (let i = 0; i < audioUrls.length; i++) {
                const audioUrl = audioUrls[i];
                const payload = {
                    audioUrl: audioUrl,
                    model: this.openAiTTSModel,
                };

                this.processStatus = `Processing audio file ${i + 1} of ${audioUrls.length}...`;
                console.log(this.processStatus);

                const response: any = await this.http
                    .post(`${this.backendUrl}/transcribe-audio-url`, payload)
                    .toPromise();
                const transcription = `Audio: ${audioUrl}\nTranscription: ${response.transcription}`;
                console.log(transcription);
                audioTranscriptions[audioUrl] = transcription; // Store in the map
            }
            this.processStatus = 'Audio files processed successfully.';
            console.log(this.processStatus);

            // Replace links in textContent with descriptions and transcriptions
            for (const imageUrl in imageDescriptions) {
                textContent = textContent.replace(imageUrl, imageDescriptions[imageUrl]);
            }
            for (const audioUrl in audioTranscriptions) {
                textContent = textContent.replace(audioUrl, audioTranscriptions[audioUrl]);
            }

            this.contentData = textContent;
            console.log('this.contentData:', this.contentData);
            this.processStatus = 'Content data assembled successfully.';
            console.log(this.processStatus);

            // Fetch questions
            this.processStatus = 'Fetching questions...';
            console.log(this.processStatus);

            const questionsResponse: any = await this.http
                .get(`${this.backendUrl}/fetch-questions`, { params: { apiKey: this.apiKey } })
                .toPromise();
            this.globalQuestions = questionsResponse.questions;
            this.processStatus = 'Questions fetched successfully.';
            console.log(this.processStatus);

            // Prepare prompt
            this.processStatus = 'Preparing prompt for OpenAI model...';
            console.log(this.processStatus);

            this.globalPrompt = `
  Task: Analyze the materials from Professor Andrzej Maj's publication. The materials consist of text, images, and audio files, all of which are contextually connected. Your goal is to answer the following questions accurately based on the provided data.

  Dataset (fully indexed with image descriptions and audio transcriptions):
  ${this.contentData}

  Questions:
  ${this.globalQuestions}

  Instructions:
  1. Analyze all materials comprehensively, ensuring no context is missed.
  2. Consider that each question is context-sensitive and may require cross-referencing between text, images, and audio.
  3. Answer each question concisely in one sentence.

  Format your response as JSON:
  {
      "01": "brief one-sentence answer",
      "02": "brief one-sentence answer",
      "03": "brief one-sentence answer",
      "NN": "brief one-sentence answer"
  }`;

            this.processStatus = 'Sending prompt to OpenAI model...';
            console.log(this.processStatus);

            const aiPayload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.globalPrompt,
            };

            const aiResponse: any = await this.http
                .post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, aiPayload)
                .toPromise();

            const responseContent = aiResponse?.choices?.[0]?.message?.content || '';

            // Parse the JSON response
            try {
                const cleanedResponse = responseContent.replace(/```json|```/g, '').trim();
                this.globalAnswers = JSON.parse(cleanedResponse);
                this.processStatus = 'AI response parsed successfully.';
                console.log(this.processStatus);
                console.log('AI Answers JSON:', this.globalAnswers);
            } catch (e) {
                this.processStatus = 'Error parsing AI response.';
                console.error(this.processStatus, e);
                return;
            }

            // Send the answers to Headquarters
            await this.sendJsonToHeadquarters(this.globalAnswers);
        } catch (error) {
            this.processStatus = 'Error processing lesson.';
            console.error(this.processStatus, error);
        }
    }

    async sendJsonToHeadquarters(answersJson: any) {
        try {
            this.processStatus = 'Sending answers to Headquarters...';
            console.log(this.processStatus);

            const reportPayload = {
                task: this.taskIdentifier,
                apikey: this.apiKey,
                answer: answersJson,
            };

            const reportUrl = 'https://centrala.ag3nts.org/report';

            this.reportResponse = await this.http.post(reportUrl, reportPayload).toPromise();
            this.processStatus = 'Lesson process completed successfully.';
            console.log(this.processStatus);
            console.log('Report response:', this.reportResponse);
        } catch (error) {
            this.processStatus = 'Failed to send data to Headquarters.';
            console.error(this.processStatus, error);
        }
    }
}
