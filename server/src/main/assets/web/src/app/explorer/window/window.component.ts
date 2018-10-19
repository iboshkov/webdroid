import {Component, ComponentFactoryResolver, ElementRef, OnInit} from '@angular/core';
import {ModalService} from 'truly-ui';
import {FileGridComponent} from '../file-grid/file-grid.component';
import {MenuItem} from 'primeng/api';
import {map} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {FSItem} from '../filesystem.service';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit {
  public modalBody: ElementRef;
  public breadcrumbs: MenuItem[] = [];
  public selected: FSItem[] = [];
  public fileFilter = '';
  private fileGrid: FileGridComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  routeActivated(grid: FileGridComponent) {
    this.fileGrid = grid;
    grid.breadcrumbsChanged.subscribe(crumbs => {
      this.breadcrumbs = crumbs;
      if (this.modalBody) {
        this.modalBody.nativeElement.scrollTo(0, 0);
      }
    });
    grid.selectionChanged.subscribe(selection => {
      this.selected = selection;
    });
  }

  filterChanged($event) {
    this.fileGrid.fileFilter = this.fileFilter;
  }
}
