import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { WasteDistributionBarChartComponent } from "~/app/components/charts/surface-chart/waste-distribution-bar-chart.component";
import { CostChartComponent } from "~/app/components/charts/cost-chart/cost-chart.component";

@NgModule({
    declarations: [
        WasteDistributionBarChartComponent,
        CostChartComponent
    ],
    imports: [
        NativeScriptCommonModule
    ],
    exports: [
        WasteDistributionBarChartComponent,
        CostChartComponent
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class ComponentsModule {
}
