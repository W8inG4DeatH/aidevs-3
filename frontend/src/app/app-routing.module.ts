import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardModule } from 'src/app/areas/dashboard/dashboard.module';
import { WidgetsPanelComponent } from 'src/app/areas/dashboard/widgets-panel/widgets-panel.component';
import { OpenAiAgentComponent } from 'src/app/ai-agents/openai-agent/openai-agent.component';

import { LessonS00E01Component } from 'src/app/lessons/lesson-s00e01/lesson-s00e01.component';
import { LessonS01E01Component } from 'src/app/lessons/lesson-s01e01/lesson-s01e01.component';
import { LessonS01E02Component } from 'src/app/lessons/lesson-s01e02/lesson-s01e02.component';
import { LessonS01E03Component } from 'src/app/lessons/lesson-s01e03/lesson-s01e03.component';
import { LessonS01E04Component } from 'src/app/lessons/lesson-s01e04/lesson-s01e04.component';
import { LessonS01E05Component } from 'src/app/lessons/lesson-s01e05/lesson-s01e05.component';
import { LessonS02E01Component } from 'src/app/lessons/lesson-s02e01/lesson-s02e01.component';
import { LessonS02E02Component } from 'src/app/lessons/lesson-s02e02/lesson-s02e02.component';
import { LessonS02E03Component } from 'src/app/lessons/lesson-s02e03/lesson-s02e03.component';
import { LessonS02E04Component } from 'src/app/lessons/lesson-s02e04/lesson-s02e04.component';
import { LessonS02E05Component } from 'src/app/lessons/lesson-s02e05/lesson-s02e05.component';
import { LessonS03E01Component } from 'src/app/lessons/lesson-s03e01/lesson-s03e01.component';
import { LessonS03E02Component } from 'src/app/lessons/lesson-s03e02/lesson-s03e02.component';
import { LessonS03E03Component } from 'src/app/lessons/lesson-s03e03/lesson-s03e03.component';
import { LessonS03E04Component } from 'src/app/lessons/lesson-s03e04/lesson-s03e04.component';
import { LessonS03E05Component } from 'src/app/lessons/lesson-s03e05/lesson-s03e05.component';
import { LessonS04E01Component } from 'src/app/lessons/lesson-s04e01/lesson-s04e01.component';
import { LessonS04E02Component } from 'src/app/lessons/lesson-s04e02/lesson-s04e02.component';
import { LessonS04E03Component } from 'src/app/lessons/lesson-s04e03/lesson-s04e03.component';
import { LessonS04E04Component } from 'src/app/lessons/lesson-s04e04/lesson-s04e04.component';
import { LessonS04E05Component } from 'src/app/lessons/lesson-s04e05/lesson-s04e05.component';
import { LessonS05E01Component } from 'src/app/lessons/lesson-s05e01/lesson-s05e01.component';
import { LessonS05E02Component } from 'src/app/lessons/lesson-s05e02/lesson-s05e02.component';

const routes: Routes = [
    { path: '', component: WidgetsPanelComponent },
    { path: 'dashboard', component: WidgetsPanelComponent },
    { path: 'ai-agents/openai-agent', component: OpenAiAgentComponent },
    { path: 'lessons/lesson-s00e01', component: LessonS00E01Component },
    { path: 'lessons/lesson-s01e01', component: LessonS01E01Component },
    { path: 'lessons/lesson-s01e02', component: LessonS01E02Component },
    { path: 'lessons/lesson-s01e03', component: LessonS01E03Component },
    { path: 'lessons/lesson-s01e04', component: LessonS01E04Component },
    { path: 'lessons/lesson-s01e05', component: LessonS01E05Component },
    { path: 'lessons/lesson-s02e01', component: LessonS02E01Component },
    { path: 'lessons/lesson-s02e02', component: LessonS02E02Component },
    { path: 'lessons/lesson-s02e03', component: LessonS02E03Component },
    { path: 'lessons/lesson-s02e04', component: LessonS02E04Component },
    { path: 'lessons/lesson-s02e05', component: LessonS02E05Component },
    { path: 'lessons/lesson-s03e01', component: LessonS03E01Component },
    { path: 'lessons/lesson-s03e02', component: LessonS03E02Component },
    { path: 'lessons/lesson-s03e03', component: LessonS03E03Component },
    { path: 'lessons/lesson-s03e04', component: LessonS03E04Component },
    { path: 'lessons/lesson-s03e05', component: LessonS03E05Component },
    { path: 'lessons/lesson-s04e01', component: LessonS04E01Component },
    { path: 'lessons/lesson-s04e02', component: LessonS04E02Component },
    { path: 'lessons/lesson-s04e03', component: LessonS04E03Component },
    { path: 'lessons/lesson-s04e04', component: LessonS04E04Component },
    { path: 'lessons/lesson-s04e05', component: LessonS04E05Component },
    { path: 'lessons/lesson-s05e01', component: LessonS05E01Component },
    { path: 'lessons/lesson-s05e02', component: LessonS05E02Component },
];

@NgModule({
    imports: [RouterModule.forRoot(routes), DashboardModule],
    exports: [RouterModule],
})
export class AppRoutingModule {}
