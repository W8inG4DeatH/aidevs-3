import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { WidgetsPanelComponent } from 'src/app/areas/dashboard/widgets-panel/widgets-panel.component';

@NgModule({
    imports: [CommonModule, FormsModule, FlexLayoutModule],
    declarations: [WidgetsPanelComponent],
})
export class DashboardModule {}
