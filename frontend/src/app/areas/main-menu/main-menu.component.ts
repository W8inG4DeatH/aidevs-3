import { Component, OnInit } from '@angular/core';
import { IMainMenuElement } from 'src/app/areas/areas.interfaces';

@Component({
    selector: 'main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit {
    public mainMenu: Array<IMainMenuElement> = [];

    constructor() {}

    ngOnInit(): void {
        this.InitMainMenu();
    }

    InitMainMenu() {
        this.mainMenu = [
            {
                DisplayName: 'Dashboard',
                RouterLink: '/dashboard',
            },
            {
                DisplayName: 'Lesson 01',
                RouterLink: '/lessons/lesson-01',
            },
            {
                DisplayName: 'OpenAI Agent',
                RouterLink: '/ai-agents/openai-agent',
            },
        ];
    }
}
