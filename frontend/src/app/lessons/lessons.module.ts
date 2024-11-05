import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

import { LessonS00E01Module } from './lesson-s00e01/lesson-s00e01.module';
import { LessonS01E01Module } from './lesson-s01e01/lesson-s01e01.module';
import { LessonS01E02Module } from './lesson-s01e02/lesson-s01e02.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        CommonComponentsModule,

        LessonS00E01Module,
        LessonS01E01Module,
        LessonS01E02Module,
    ],
})
export class LessonsModule { }
