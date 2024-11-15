import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

import { LessonS02E05Component } from './lesson-s02e05.component';

@NgModule({
    imports: [CommonModule, FormsModule, FlexLayoutModule, CommonComponentsModule],
    declarations: [LessonS02E05Component],
})
export class LessonS02E05Module {}
