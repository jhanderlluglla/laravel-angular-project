import {RouterModule, Routes} from '@angular/router';
import {NgModule} from "@angular/core";
import {AppearanceComponent} from "./appearance.component";
import {CanDeactivateAppearance} from "./can-deactivate-appearance.guard";

const routes: Routes = [
    {path: '', component: AppearanceComponent, canDeactivate: [CanDeactivateAppearance]},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppearanceRoutingModule {}