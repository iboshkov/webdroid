import { Injectable } from '@angular/core';
import {ExplorerModule} from './explorer.module';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment as env} from '../../environments/environment';
import {map} from 'rxjs/operators';

export class FSItem {
  name?: string;
  path?: string;
  absolutePath?: string;
  cannonicalPath?: string;
  isDirectory?: boolean;
  isFile?: boolean;
  loading?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FilesystemService {

  constructor(private http: HttpClient) { }

  getItemsInPath(path: string): Observable<FSItem[]> {
    return this.http.get<any>(`${env.baseUrl}/rest/filesystem/list/?path=${path}`)
      .pipe(map(response => response.files)) as Observable<FSItem[]>;
  }
}
