import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

import { LessonS04E04Component } from './lesson-s04e04.component';

@NgModule({
    imports: [CommonModule, FormsModule, FlexLayoutModule, CommonComponentsModule],
    declarations: [LessonS04E04Component],
})
export class LessonS04E04Module {}
