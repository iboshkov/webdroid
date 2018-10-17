import {Component, Input, OnInit} from '@angular/core';
import {FSItem} from '../../filesystem.service';

@Component({
  selector: 'app-grid-item',
  templateUrl: './grid-item.component.html',
  styleUrls: ['./grid-item.component.scss']
})
export class GridItemComponent implements OnInit {
  @Input() model: FSItem = {};

  constructor() { }

  ngOnInit() {
  }

}
