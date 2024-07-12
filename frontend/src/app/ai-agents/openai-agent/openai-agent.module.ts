import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

import { PromptsDatabaseModule } from 'src/app/databases/prompts-database/prompts-database.module';

import { OpenAiAgentComponent } from './openai-agent.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        CommonComponentsModule,
        PromptsDatabaseModule,
    ],
    declarations: [OpenAiAgentComponent],
    exports: [OpenAiAgentComponent],
})
export class OpenAiAgentModule {}

