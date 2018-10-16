import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, UrlSegment} from '@angular/router';
import {filter, map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MenuItem} from 'primeng/api';
import {FilesystemService, FSItem} from '../filesystem.service';

@Component({
  selector: 'app-file-grid',
  templateUrl: './file-grid.component.html',
  styleUrls: ['./file-grid.component.scss']
})
export class FileGridComponent implements OnInit {
  private routeChange: Observable<string>;
  public breadcrumbs: MenuItem[];
  public location = '/';
  public files: FSItem[] = [];
  public selectedItems = [];
  @Output() public locationChanged = new EventEmitter<string>();
  @Output() public locationSegmentsChanged = new EventEmitter<UrlSegment[]>();


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fs: FilesystemService
  ) {
    this.routeChange = route.url.pipe(
      tap(segments => this.locationSegmentsChanged.emit(segments)),
      map(segments => `/${segments.join('/')}`),
      tap(url => {
        this.location = url;
        this.locationChanged.emit(this.location);
      }),
    );

    setInterval()
  }

  ngOnInit() {
    this.routeChange.subscribe(this.reloadData.bind(this));
  }

  reloadData() {
    this.fs.getItemsInPath(this.location).subscribe(items => {
      this.files = items;
    });
  }

  onSelect($event) {
    console.log('Selected ', $event);
  }
}
