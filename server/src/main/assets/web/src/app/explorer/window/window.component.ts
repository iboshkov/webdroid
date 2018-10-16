import {Component, ComponentFactoryResolver, OnInit} from '@angular/core';
import {ModalService} from 'truly-ui';
import {FileGridComponent} from '../file-grid/file-grid.component';
import {MenuItem} from 'primeng/api';

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

  constructor(
  ) { }

  ngOnInit() {
  }

  segmentsChanged(segments) {
    console.log('Activated ', segments);
    this.breadcrumbs = [{ icon: 'pi pi-home', routerLink: [{}] }];

      this.breadcrumbs = this.breadcrumbs.concat(segments.map((segment, idx) => {
        let routerLink = ['../'.repeat(segments.length - idx - 1)];
        const isLast = idx === segments.length - 1;
        if (isLast) { routerLink = ['.']; }

        return {
          label: segment.path,
          routerLink
        };
    }));
  }

  routeActivated(grid: FileGridComponent) {
    console.log('Activated ', grid);

    grid.locationSegmentsChanged.subscribe(this.segmentsChanged.bind(this));
  }
}
