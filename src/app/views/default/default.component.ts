import {Component, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-default',
  template: ''
})
export class DefaultComponent implements OnInit {

  constructor() {
    window.location.href = environment.otherData.defaultPath;
  }

  ngOnInit() {
  }

}
