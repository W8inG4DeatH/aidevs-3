import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

import { PromptsDatabaseComponent } from './prompts-database.component';
import { PromptsDatabaseService } from 'src/app/databases/prompts-database/prompts-database.service';

@NgModule({
    imports: [CommonModule, FormsModule, FlexLayoutModule, CommonComponentsModule],
    declarations: [PromptsDatabaseComponent],
    exports: [PromptsDatabaseComponent],
    providers: [PromptsDatabaseService],
})
export class PromptsDatabaseModule {}
