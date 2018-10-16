import {Component, ComponentFactoryResolver, OnInit} from '@angular/core';
import {ModalService} from 'truly-ui';
import {WindowComponent} from '../window/window.component';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {

  constructor(
    public compiler: ComponentFactoryResolver, public modalService: ModalService
  ) { }

  ngOnInit() {

  }

}
