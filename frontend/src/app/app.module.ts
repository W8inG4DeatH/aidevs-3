import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AppRoutingModule } from 'src/app/app-routing.module';

import { AiAgentsModule } from './ai-agents/ai-agents.module';
import { AreasModule } from 'src/app/areas/areas.module';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';
import { LessonsModule } from './lessons/lessons.module';

import { AppComponent } from 'src/app/app.component';

import { AppService } from 'src/app/app.service';

import { BACKEND_URL } from 'src/app/constants';

const config: SocketIoConfig = { url: BACKEND_URL, options: {} };

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        FormsModule,
        FlexLayoutModule,
        SocketIoModule.forRoot(config),
        AppRoutingModule,
        AiAgentsModule,
        AreasModule,
        CommonComponentsModule,
        LessonsModule,
    ],
    providers: [AppService],
    bootstrap: [AppComponent],
})
export class AppModule {}
