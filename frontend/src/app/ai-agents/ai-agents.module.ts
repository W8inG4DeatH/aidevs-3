import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { OpenAiAgentModule } from './openai-agent/openai-agent.module';

@NgModule({
    imports: [CommonModule, OpenAiAgentModule, HttpClientModule],
})
export class AiAgentsModule {}

