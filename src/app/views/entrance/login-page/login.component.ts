import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserServiceNs, UserService} from '../../../core/common-services/user.service';
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;
  loginReqData: UserServiceNs.AuthLoginReqModel;
  verifyImgUrl: string;
  remark: string;
  loading: boolean;

  constructor(private userService: UserService, private router: Router,
              private formBuilder: FormBuilder, private activeRouter: ActivatedRoute
  ) {
    this.loginReqData = {
      authId: '',
      loginName: '',
      password: '',
      code: '',
    };
    this.verifyImgUrl = '';
    this.remark = '';
    this.loading = false;
  }

  public refreshVerify() {
    this.userService.getAuthInfo()
      .subscribe((data: UserServiceNs.AuthInfoResModel) => {
        this.verifyImgUrl = data.value.verifyImgUrl;
        console.log(data.value.verifyImgUrl);
        this.loginReqData.authId = data.value.authId;
      }, (error: UserServiceNs.HttpError) => {
        this.remark = error.message;
      });
  }

  public loginSubmit() {

    for (let key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    if (this.validateForm.invalid) {
      return;
    }
    this.loading = true;
    this.userService.postLogin(this.loginReqData)
      .subscribe((resData: UserServiceNs.AuthAnyResModel) => {
        this.loading = false;

        if (resData.code !== 0) {
          this.remark = resData.message;
          this.refreshVerify();
          return;
        }
        this.router.navigate(['../main/workBoard'], {
          relativeTo: this.activeRouter
        });
      }, (error: UserServiceNs.HttpError) => {
        this.remark = error.message;
        this.loading = false;
      });
  }

  ngOnInit() {
    this.refreshVerify();

    this.validateForm = this.formBuilder.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      verifyCode: [null, [Validators.required]],
    });
  }
}
