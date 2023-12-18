import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { GridComponent } from './grid.component';
import { GridListViewComponent } from './list-view/list-view.component';
import { GridCardViewComponent } from './card-view/card-view.component';

@NgModule({
  declarations: [
    GridComponent,
    GridListViewComponent,
    GridCardViewComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  exports: [GridComponent],
})
export class GridModule { }
