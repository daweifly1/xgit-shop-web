import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {Observable} from 'rxjs/Observable';
@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
