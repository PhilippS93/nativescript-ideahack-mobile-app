import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { DetailsRoutingModule } from "./details-routing.module";
import { DetailsComponent } from "./details.component";
import { ComponentsModule } from "~/app/components/components.module";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        DetailsRoutingModule,

        ComponentsModule
    ],
    declarations: [
        DetailsComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class DetailsModule { }
