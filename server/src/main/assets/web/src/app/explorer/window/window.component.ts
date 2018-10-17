import {Component, ComponentFactoryResolver, OnInit} from '@angular/core';
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
  menuItems = [
    {
      label: 'File',
      items: [{
        label: 'New',
        icon: 'pi pi-fw pi-plus',
        items: [
          {label: 'Project'},
          {label: 'Other'},
        ]
      },
        {label: 'Open'},
        {label: 'Quit'}
      ]
    },
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pencil',
      items: [
        {label: 'Delete', icon: 'pi pi-fw pi-trash'},
        {label: 'Refresh', icon: 'pi pi-fw pi-refresh'}
      ]
    }
  ];
  public breadcrumbs: MenuItem[] = [];
  public selected: FSItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  routeActivated(grid: FileGridComponent) {
    console.log('Activated ', grid);

    grid.breadcrumbsChanged.subscribe(crumbs => this.breadcrumbs = crumbs);
    grid.selectionChanged.subscribe(selection => {
      this.selected = selection;
    });
  }
}
