import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) {

  }

  listado(): Observable<any> {
    const httpOptions: any = {
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Headers": '*'
      })
    };

    return this.httpClient
      .get<any>('https://jsonplaceholder.typicode.com/users/1/todos?completed=true', httpOptions)
      .pipe(retry(1), catchError(this.handleError));
  }

  public guardar = (data: any) => {
    return this.httpClient.post("https://jsonplaceholder.typicode.com/users/1/todos", data);
  }

  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
}
