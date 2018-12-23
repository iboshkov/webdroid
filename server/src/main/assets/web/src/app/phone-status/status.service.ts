import { Injectable } from '@angular/core';
import {environment as env} from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PhoneStatus } from './models/phone-status';
import { PhoneInfo } from './models/phone-info';
import { Observable, merge, interval } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(private http: HttpClient) { }


  getPhoneInfo() {
    return this.http.get<PhoneInfo>(`${env.baseUrl}/rest/phone/info`);
  }

  fetchPhoneStatus() {
    return this.http.get<PhoneStatus>(`${env.baseUrl}/rest/phone/status`);
  }

  getPhoneStatus(): Observable<PhoneStatus> {
    return merge(
      this.fetchPhoneStatus(),
      interval(1000).pipe(
        concatMap(x => this.fetchPhoneStatus())
      )
    );
  }
}
