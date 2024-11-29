import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

import { LessonS00E01Module } from './lesson-s00e01/lesson-s00e01.module';
import { LessonS01E01Module } from './lesson-s01e01/lesson-s01e01.module';
import { LessonS01E02Module } from './lesson-s01e02/lesson-s01e02.module';
import { LessonS01E03Module } from './lesson-s01e03/lesson-s01e03.module';
import { LessonS01E04Module } from './lesson-s01e04/lesson-s01e04.module';
import { LessonS01E05Module } from './lesson-s01e05/lesson-s01e05.module';
import { LessonS02E01Module } from './lesson-s02e01/lesson-s02e01.module';
import { LessonS02E02Module } from './lesson-s02e02/lesson-s02e02.module';
import { LessonS02E03Module } from './lesson-s02e03/lesson-s02e03.module';
import { LessonS02E04Module } from './lesson-s02e04/lesson-s02e04.module';
import { LessonS02E05Module } from './lesson-s02e05/lesson-s02e05.module';
import { LessonS03E01Module } from './lesson-s03e01/lesson-s03e01.module';
import { LessonS03E02Module } from './lesson-s03e02/lesson-s03e02.module';
import { LessonS03E03Module } from './lesson-s03e03/lesson-s03e03.module';
import { LessonS03E04Module } from './lesson-s03e04/lesson-s03e04.module';
import { LessonS03E05Module } from './lesson-s03e05/lesson-s03e05.module';
import { LessonS04E01Module } from './lesson-s04e01/lesson-s04e01.module';
import { LessonS04E02Module } from './lesson-s04e02/lesson-s04e02.module';
import { LessonS04E03Module } from './lesson-s04e03/lesson-s04e03.module';
import { LessonS04E04Module } from './lesson-s04e04/lesson-s04e04.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        CommonComponentsModule,
        LessonS00E01Module,
        LessonS01E01Module,
        LessonS01E02Module,
        LessonS01E03Module,
        LessonS01E04Module,
        LessonS01E05Module,
        LessonS02E01Module,
        LessonS02E02Module,
        LessonS02E03Module,
        LessonS02E04Module,
        LessonS02E05Module,
        LessonS03E01Module,
        LessonS03E02Module,
        LessonS03E03Module,
        LessonS03E04Module,
        LessonS03E05Module,
        LessonS04E01Module,
        LessonS04E02Module,
        LessonS04E03Module,
        LessonS04E04Module,
    ],
})
export class LessonsModule { }
