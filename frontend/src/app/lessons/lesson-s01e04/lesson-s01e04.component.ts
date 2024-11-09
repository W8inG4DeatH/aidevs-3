import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IOpenAIModel } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'app-lesson-s01e04',
    templateUrl: './lesson-s01e04.component.html',
    styleUrls: ['./lesson-s01e04.component.scss'],
})
export class LessonS01E04Component implements OnInit {
    public openAiModel: IOpenAIModel = IOpenAIModel.GPT4oMini;

    public openAiPrompt: string = `<p>
<br>Stwórz STEPS_TABLE robota na mapie, która jest siatką:
<br>1) Każde pole mapy to liczba od 1 do 24. Każdy krok może być jedną z trzech operacji: +1 lub -1 lub +4
<br>2) Dodatkowa zasada: Jeśli (obecny wynik % 4 === 0), nie możesz użyć +1.
<br>3) WAŻNE: Zakazane liczby, których nie możesz krokowo zdobywać to: 5, 6, 8, 14, 15.
<br>4) Cel: Zaczynając od liczby 1 osiągnij krokowo liczbę 21 nie przekraczając jej wartości.
<br>5) Zamień STEPS_TABLE na STEP_SERIE usuwając nawiasy [] i podmień kroki liczbowe na wyrazy bez cudzysłowia oddzielone przecinkami: +1 na UP, +1 na DOWN, +4 na RIGHT
<br>6) Zwróć sam JSON bez znaków markdown:
<br>{ steps": "STEP_SERIE" }</p>`;

constructor(private http: HttpClient) { }

ngOnInit() { }

}
