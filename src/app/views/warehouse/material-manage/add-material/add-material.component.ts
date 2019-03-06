import {Component, OnInit, ViewChild, TemplateRef, Output, Input, EventEmitter} from '@angular/core';
import { Validators, FormGroup, FormBuilder, ControlContainer, FormArray } from '@angular/forms';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {MaterialManageServiceNs, MaterialManageService} from '../../../../core/trans/materialManage.service';

@Component({
  selector: 'app-add-material',
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.scss']
})
export class AddMaterialComponent implements OnInit {
  @Output()finish: EventEmitter<any>;
  newMaterialForm: FormGroup;
  constructor(private materialManageService: MaterialManageService,
     private messageService: ShowMessageService, private formBuilder: FormBuilder) {
    this.finish = new EventEmitter();
  }

  public toggleManagePage() {
    this.newMaterialForm.reset();
    this.emitFinish();
  }

  public emitFinish() {
    this.finish.emit();
  }
  ngOnInit() {
    this.newMaterialForm = this.formBuilder.group({
      warehouseCode: [null, Validators.required],
      description: [null, Validators.required],
      isPlan: ['0'],
    });
  }

}
