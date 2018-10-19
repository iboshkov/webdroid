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
  public fileFilter = '';

  public files: FSItem[] = [];

  public get filteredFiles() {
    return this.files.filter(x =>
      !this.fileFilter || x.name.toLowerCase().indexOf(this.fileFilter.toLowerCase()) >= 0
    );
  }

  public selectedItems = [];

  @Output() public locationChanged = new EventEmitter<string>();
  @Output() public locationSegmentsChanged = new EventEmitter<UrlSegment[]>();
  @Output() public breadcrumbsChanged = new EventEmitter<MenuItem[]>();
  @Output() public selectionChanged = new EventEmitter<FSItem[]>();
  @Output() public loadingChanged = new EventEmitter<boolean>();

  @ViewChild('container') container: any;
  private _loading = false;
  public get loading() {
    return this._loading;
  }

  public set loading(val) {
    this._loading = val;
    this.loadingChanged.emit(val);
  }

  public showImageBox = false;
  public selectedItem: FSItem = null;

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

    this.locationSegmentsChanged.pipe(map(this.makeBreadcrumbs.bind(this)));
    this.loadingChanged.subscribe(loading => {
      this.makeBreadcrumbs(this.route.snapshot.url);
    });
  }

  makeBreadcrumbs(segments: UrlSegment[]) {
    let breadcrumbs: MenuItem[] = [
      {icon: 'pi pi-arrow-left', command: () => this.locationSvc.back()},
      {icon: 'pi pi-arrow-right', command: () => this.locationSvc.forward()},
      {icon: 'pi pi-arrow-up', command: () => this.navigate(['../'])},
      {icon: `fas fa-sync-alt ${this.loading && 'fa-spin' || ''}`, command: () => this.reloadData()},
      {icon: 'pi pi-home', routerLink: [{}]}
    ];
    breadcrumbs = breadcrumbs.concat(segments.map((segment, idx) => {
      const routerLink = segments.map(x => x.toString()).slice(0, idx + 1);
      return {
        label: segment.path,
        routerLink
      };
    }));

    this.breadcrumbsChanged.emit(breadcrumbs);
    return breadcrumbs;
  }

  ngOnInit() {
    this.routeChange.subscribe(this.reloadData.bind(this));
  }

  setLoading(loading) {
    if (loading) {
      this.loading = true;
      this.files = Array.from(Array(60)).map(x => (Object.assign(new FSItem(), {loading: true})));
      return;
    }

    this.loading = false;
  }

  reloadData() {
    this.setLoading(true);

    this.fs.getItemsInPath(this.location)
      .pipe(
        tap(x => this.setLoading(false)),
        map(files => files.map(x =>
          Object.assign(x, { serveUrl:  this.fs.getServeUrl('/' + this.route.snapshot.url.join('/'), x) }
        )))
      )
      .subscribe(items => {
        console.log(items)
        this.files = items.sort((a) => a.isDirectory ? -1 : 1);
      });
  }

  onSelect($event: FSItem[]) {
    console.log('Selected ', $event);
    this.selectionChanged.emit($event);
  }

  async navigate(commands: any) {
    await this.router.navigate(commands, {relativeTo: this.route});
  }

  ngAfterViewInit(): void {
    setInterval(() => this.container.update(), 300);
  }

  itemClicked(item: FSItem) {
    if (!item.isImage) return;

    this.showImageBox = true;
    this.selectedItem = item;
  }
}
