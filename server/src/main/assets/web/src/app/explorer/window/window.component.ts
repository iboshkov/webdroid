import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit {
  items = [
    {label: 'Categories'},
    {label: 'Sports'},
    {label: 'Football'},
    {label: 'Countries'},
    {label: 'Spain'},
    {label: 'F.C. Barcelona'},
    {label: 'Squad'},
    {label: 'Lionel Messi', url: 'https://en.wikipedia.org/wiki/Lionel_Messi'}
  ];

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

  constructor() { }

  ngOnInit() {
  }

}
