import {Component,  Input, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {FilesystemService, FSItem} from '../../filesystem.service';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-grid-item',
  templateUrl: './grid-item.component.html',
  styleUrls: ['./grid-item.component.scss']
})
export class GridItemComponent implements OnInit {
  @Input() model = new FSItem();
  url = '';

  constructor() { }

  ngOnInit() {
  }

  initDeferred() {
    console.log('Init deferred');
    this.url = this.model.serveUrl;
  }
}
