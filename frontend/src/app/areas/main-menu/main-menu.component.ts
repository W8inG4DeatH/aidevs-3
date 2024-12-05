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
                DisplayName: 'Lesson s00e01',
                RouterLink: '/lessons/lesson-s00e01',
            },
            {
                DisplayName: 'Lesson s01e01',
                RouterLink: '/lessons/lesson-s01e01',
            },
            {
                DisplayName: 'Lesson s01e02',
                RouterLink: '/lessons/lesson-s01e02',
            },
            {
                DisplayName: 'Lesson s01e03',
                RouterLink: '/lessons/lesson-s01e03',
            },
            {
                DisplayName: 'Lesson s01e04',
                RouterLink: '/lessons/lesson-s01e04',
            },
            {
                DisplayName: 'Lesson s01e05',
                RouterLink: '/lessons/lesson-s01e05',
            },
            {
                DisplayName: 'Lesson s02e01',
                RouterLink: '/lessons/lesson-s02e01',
            },
            {
                DisplayName: 'Lesson s02e02',
                RouterLink: '/lessons/lesson-s02e02',
            },
            {
                DisplayName: 'Lesson s02e03',
                RouterLink: '/lessons/lesson-s02e03',
            },
            {
                DisplayName: 'Lesson s02e04',
                RouterLink: '/lessons/lesson-s02e04',
            },
            {
                DisplayName: 'Lesson s02e05',
                RouterLink: '/lessons/lesson-s02e05',
            },
            {
                DisplayName: 'Lesson s03e01',
                RouterLink: '/lessons/lesson-s03e01',
            },
            {
                DisplayName: 'Lesson s03e02',
                RouterLink: '/lessons/lesson-s03e02',
            },
            {
                DisplayName: 'Lesson s03e03',
                RouterLink: '/lessons/lesson-s03e03',
            },
            {
                DisplayName: 'Lesson s03e04',
                RouterLink: '/lessons/lesson-s03e04',
            },
            {
                DisplayName: 'Lesson s03e05',
                RouterLink: '/lessons/lesson-s03e05',
            },
            {
                DisplayName: 'Lesson s04e01',
                RouterLink: '/lessons/lesson-s04e01',
            },
            {
                DisplayName: 'Lesson s04e02',
                RouterLink: '/lessons/lesson-s04e02',
            },
            {
                DisplayName: 'Lesson s04e03',
                RouterLink: '/lessons/lesson-s04e03',
            },
            {
                DisplayName: 'Lesson s04e04',
                RouterLink: '/lessons/lesson-s04e04',
            },
            {
                DisplayName: 'Lesson s04e05',
                RouterLink: '/lessons/lesson-s04e05',
            },
            {
                DisplayName: 'Lesson s05e01',
                RouterLink: '/lessons/lesson-s05e01',
            },
            {
                DisplayName: 'Lesson s05e02',
                RouterLink: '/lessons/lesson-s05e02',
            },
            {
                DisplayName: 'OpenAI Agent',
                RouterLink: '/ai-agents/openai-agent',
            },
        ];
    }
}
