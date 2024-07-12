import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

import { Lesson00Module } from './lesson-00/lesson-00.module';
import { Lesson01Module } from './lesson-01/lesson-01.module';

@NgModule({
    imports: [CommonModule, FormsModule, FlexLayoutModule, CommonComponentsModule, Lesson00Module, Lesson01Module],
})
export class LessonsModule {}
