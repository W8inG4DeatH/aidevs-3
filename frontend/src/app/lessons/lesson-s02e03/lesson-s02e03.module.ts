import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

import { LessonS02E03Component } from './lesson-s02e03.component';

@NgModule({
    imports: [CommonModule, FormsModule, FlexLayoutModule, CommonComponentsModule],
    declarations: [LessonS02E03Component],
})
export class LessonS02E03Module {}