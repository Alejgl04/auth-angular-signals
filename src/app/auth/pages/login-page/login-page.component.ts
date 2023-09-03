import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'


@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  private fb          = inject( FormBuilder );
  private authService = inject( AuthService );
  private router      = inject( Router );

  public signInForm: FormGroup = this.fb.group({
    email: ['alejandro@google.com', [Validators.required, Validators.email ]],
    password: ['123456', [Validators.required, Validators.minLength(6) ]],
  });

  signIn(): void {
    const { email, password } = this.signInForm.value;
    this.authService.signIn(email, password)
      .subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: ( message ) => {

          Swal.fire('Error', message, 'error')

        }
      })
  }
}
