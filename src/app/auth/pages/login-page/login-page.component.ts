import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  private fb = inject( FormBuilder );
  private authService = inject( AuthService );

  public signInForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email ]],
    password: ['', [Validators.required, Validators.minLength(6) ]],
  });

  signIn(): void {
    const { email, password } = this.signInForm.value;
    this.authService.signIn(email, password)
      .subscribe( response => {
        console.log(response);
      })
  }
}
