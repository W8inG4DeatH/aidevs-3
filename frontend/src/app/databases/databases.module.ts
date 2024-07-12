import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { PromptsDatabaseModule } from 'src/app/databases/prompts-database/prompts-database.module';

@NgModule({
    imports: [CommonModule, FormsModule, FlexLayoutModule, PromptsDatabaseModule],
})
export class DatabasesModule {}
