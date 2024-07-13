import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAiFile, IOpenAIModel } from 'src/app/common-components/common-components.interfaces';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'openai-agent',
    templateUrl: './openai-agent.component.html',
    styleUrls: ['./openai-agent.component.scss'],
})
export class OpenAiAgentComponent implements OnInit {
    public openAiModels = Object.values(IOpenAIModel);
    public aiProcessing: boolean = false;
    public aiResponse: string = 'Tutaj będzie odpowiedź AI.';
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT35Turbo0125;
    public myAIPrompt: string = '';

    constructor(private http: HttpClient) { }

    ngOnInit() { }

    sendPrompt() {
        if (this.myAIPrompt?.length > 0) {
            this.aiProcessing = true;
            const payload = {
                openAiModel: this.openAiModel,
                myAIPrompt: this.myAIPrompt,
            };

            this.http.post(`${environment.apiUrl}/ai_agents/openai_agent/send-prompt`, payload).subscribe({
                next: (response: any) => {
                    this.aiResponse = response.choices[0].message.content;
                    this.aiProcessing = false;
                },
                error: (error: any) => {
                    console.error('Error sending prompt:', error);
                    this.aiProcessing = false;
                },
            });
        }
    }

    selectPrompt(prompt: IAiFile | null): void {
        this.myAIPrompt = prompt?.Content ?? '';
    }

    addToPrompt(promptPart: string | null): void {
        this.myAIPrompt += '\n\n' + '################################' + '\n\n' + promptPart;
    }
}

