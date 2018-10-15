import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-file-grid',
  templateUrl: './file-grid.component.html',
  styleUrls: ['./file-grid.component.scss']
})
export class FileGridComponent implements OnInit {
  private routeChange: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.routeChange = route.url.pipe(map(segments => `/${segments.join("/")}`));

  }

  ngOnInit() {
    this.routeChange.subscribe(route => console.log(route));
  }

}
