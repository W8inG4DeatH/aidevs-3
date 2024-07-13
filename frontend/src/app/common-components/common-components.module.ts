import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { UserComponent } from 'src/app/common-components/user/user.component';

import { TextareaAutoheightDirective } from 'src/app/directives/textarea-autoheight.directive';

@NgModule({
    imports: [CommonModule, FlexLayoutModule],
    declarations: [UserComponent, TextareaAutoheightDirective],
    exports: [UserComponent, TextareaAutoheightDirective],
})
export class CommonComponentsModule {}
