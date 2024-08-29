import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardModule } from 'src/app/areas/dashboard/dashboard.module';
import { WidgetsPanelComponent } from 'src/app/areas/dashboard/widgets-panel/widgets-panel.component';
import { OpenAiAgentComponent } from 'src/app/ai-agents/openai-agent/openai-agent.component';

import { LessonS00E01Component } from 'src/app/lessons/lesson-s00e01/lesson-s00e01.component';

const routes: Routes = [
    { path: '', component: WidgetsPanelComponent },
    { path: 'dashboard', component: WidgetsPanelComponent },
    { path: 'lessons/lesson-s00e01', component: LessonS00E01Component },
    { path: 'ai-agents/openai-agent', component: OpenAiAgentComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes), DashboardModule],
    exports: [RouterModule],
})
export class AppRoutingModule {}
