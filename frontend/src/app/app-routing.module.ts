import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardModule } from 'src/app/areas/dashboard/dashboard.module';
import { WidgetsPanelComponent } from 'src/app/areas/dashboard/widgets-panel/widgets-panel.component';
import { OpenAiAgentComponent } from 'src/app/ai-agents/openai-agent/openai-agent.component';

import { LessonS00E01Component } from 'src/app/lessons/lesson-s00e01/lesson-s00e01.component';
import { LessonS01E01Component } from 'src/app/lessons/lesson-s01e01/lesson-s01e01.component';
import { LessonS01E02Component } from 'src/app/lessons/lesson-s01e02/lesson-s01e02.component';
import { LessonS01E03Component } from 'src/app/lessons/lesson-s01e03/lesson-s01e03.component';

const routes: Routes = [
    { path: '', component: WidgetsPanelComponent },
    { path: 'dashboard', component: WidgetsPanelComponent },
    { path: 'lessons/lesson-s00e01', component: LessonS00E01Component },
    { path: 'lessons/lesson-s01e01', component: LessonS01E01Component },
    { path: 'lessons/lesson-s01e02', component: LessonS01E02Component },
    { path: 'lessons/lesson-s01e03', component: LessonS01E03Component },
    { path: 'ai-agents/openai-agent', component: OpenAiAgentComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes), DashboardModule],
    exports: [RouterModule],
})
export class AppRoutingModule {}
