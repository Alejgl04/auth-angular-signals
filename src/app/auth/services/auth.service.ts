import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from './../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { User, AuthStatus, SignInResponse, CheckTokenResponse } from '../interfaces';


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

  private setAuthentication(user: User, token: string): boolean {

    this._currentUser.set( user );
    this._authStatus.set( AuthStatus.authenticated );
    this.storeTokens(token);
    return true;

  }

  signIn( email: string, password: string ): Observable<Boolean> {
    const url  = `${ this.apiUrl }/auth/login`;
    const body = { email, password };

    return this.http.post<SignInResponse>( url, body )
      .pipe(
        map( ({ user, token }) => this.setAuthentication(user, token)),
        catchError( error => throwError( () => error.error.message))
      );
  }

  checkAuthStatus(): Observable<Boolean> {
    const url  = `${ this.apiUrl }/auth/checktoken`;
    const token = this.getJwtToken();

    if (!token) return of(false);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<CheckTokenResponse>(url, { headers })
      .pipe(
        map( ({ token, user }) => this.setAuthentication(user, token)),
        catchError(() => {
          this._authStatus.set( AuthStatus.notAuthenticated )
          return of(false)
        })
    );
  }

  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN) || '';
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
