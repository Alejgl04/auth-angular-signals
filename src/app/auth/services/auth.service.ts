import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from './../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { User, AuthStatus, SignInResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl: string = environment.apiUrl;
  private http = inject( HttpClient );

  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  private _currentUser = signal<User|null>(null);
  private _authStatus  = signal<AuthStatus>( AuthStatus.checking );

  public currentUser = computed( () => this._currentUser() );
  public authStatus = computed( () => this._authStatus() );

  constructor() { }

  signIn( email: string, password: string ): Observable<Boolean> {
    const url  = `${ this.apiUrl }/auth/login`;
    const body = { email, password };

    return this.http.post<SignInResponse>( url, body )
      .pipe(
        tap( ({ user, token }) => {
          this._currentUser.set( user );
          this._authStatus.set( AuthStatus.authenticated );
          this.storeTokens(token);
        }),

        map( () => true ),
        catchError( error => throwError( () => error.error.message))
      );
  }

  private storeJwtToken(jwt: string) {
    localStorage.setItem(this.JWT_TOKEN, jwt);
  }

  private storeTokens(tokens: string) {
    localStorage.setItem(this.JWT_TOKEN, tokens);
    localStorage.setItem(this.REFRESH_TOKEN, tokens);
  }

  private removeTokens() {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }
}
