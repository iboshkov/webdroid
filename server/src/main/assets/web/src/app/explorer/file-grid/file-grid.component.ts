import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, UrlSegment} from '@angular/router';
import {filter, map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MenuItem} from 'primeng/api';
import {FilesystemService, FSItem} from '../filesystem.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-file-grid',
  templateUrl: './file-grid.component.html',
  styleUrls: ['./file-grid.component.scss']
})
export class FileGridComponent implements OnInit, AfterViewInit {
  private routeChange: Observable<string>;
  public location = '/';
  public files: FSItem[] = [];
  public selectedItems = [];
  @Output() public locationChanged = new EventEmitter<string>();
  @Output() public locationSegmentsChanged = new EventEmitter<UrlSegment[]>();
  @Output() public breadcrumbsChanged = new Observable<MenuItem[]>();
  @Output() public selectionChanged = new EventEmitter<FSItem[]>();

  @ViewChild('container') container: any;
  public loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fs: FilesystemService,
    private locationSvc: Location
  ) {
    this.routeChange = route.url.pipe(
      tap(segments => this.locationSegmentsChanged.emit(segments)),
      map(segments => `/${segments.join('/')}`),
      tap(url => {
        this.location = url;
        this.locationChanged.emit(this.location);
      }),
    );

    this.breadcrumbsChanged = this.locationSegmentsChanged.pipe(map(segments => {
      let breadcrumbs: MenuItem[] = [
        {icon: 'pi pi-arrow-left', command: () => this.locationSvc.back()},
        {icon: 'pi pi-arrow-right', command: () => this.locationSvc.forward()},
        {icon: 'pi pi-arrow-up', routerLink: ['../']},
        {icon: 'fas fa-sync-alt', command: () => this.reloadData()},
        {icon: 'pi pi-home', routerLink: [{}]}
      ];

      breadcrumbs = breadcrumbs.concat(segments.map((segment, idx) => {
        const routerLink = segments.map(x => x.toString()).slice(0, idx + 1); //['DCIM', 'Camera'];

        return {
          label: segment.path,
          routerLink
        };
      }));
      return breadcrumbs;
    }));
  }

  ngOnInit() {
    this.routeChange.subscribe(this.reloadData.bind(this));
  }

  setLoading(loading) {
    if (loading) {
      this.loading = true;
      this.files = Array.from(Array(30)).map(x => ({ loading: true }));
      return;
    }

    this.loading = false;
  }

  reloadData() {
    this.setLoading(true);

    this.fs.getItemsInPath(this.location)
      .pipe(tap(x => this.setLoading(false)))
      .subscribe(items => {
        this.files = items;
      });
  }

  onSelect($event: FSItem[]) {
    console.log('Selected ', $event);
    this.selectionChanged.emit($event);
  }

  ngAfterViewInit(): void {
    setInterval(() => this.container.update(), 300);
  }
}
