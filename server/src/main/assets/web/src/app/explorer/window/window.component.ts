import {Component, ComponentFactoryResolver, ElementRef, OnInit} from '@angular/core';
import {ModalService} from 'truly-ui';
import {FileGridComponent} from '../file-grid/file-grid.component';
import {ConfirmationService, MenuItem} from 'primeng/api';
import {map} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {FilesystemService, FSItem} from '../filesystem.service';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
  providers: [ConfirmationService]
})
export class WindowComponent implements OnInit {
  public modalBody: ElementRef;
  public breadcrumbs: MenuItem[] = [];
  public selected: FSItem[] = [];
  public fileFilter = '';
  private fileGrid: FileGridComponent;
  showNewFolderDialog = false;
  newFolderName = '';
  private location: string = '/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fs: FilesystemService,
    private confirmationService: ConfirmationService
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

    grid.locationChanged
      .subscribe(loc => this.location = loc);
  }

  filterChanged($event) {
    this.fileGrid.fileFilter = this.fileFilter;
  }

  handleDownload() {
    this.fs.download(this.selected).subscribe(x => console.log('Downloading files...'));
  }

  handleDelete() {
    this.confirmationService.confirm({
      message: `Are you sure that you want to delete <strong>${this.selected.length}</strong> items ?`,
      accept: () => {
        this.fs.delete(this.selected).subscribe(res => {
        });
      }
    });

  }

  handleNewFolder() {
    this.fs.mkdir(this.location, this.newFolderName).subscribe(res => {
      this.showNewFolderDialog = false;
    });
  }
}
