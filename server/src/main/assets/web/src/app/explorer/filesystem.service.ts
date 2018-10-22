import {Injectable} from '@angular/core';
import {ExplorerModule} from './explorer.module';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment as env} from '../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

const IMAGE_EXTS = ['.jpg', '.png', '.gif'];

export class FSItem {
  name?: string;
  path?: string;
  absolutePath?: string;
  cannonicalPath?: string;
  isDirectory?: boolean;
  isFile?: boolean;
  loading?: boolean;
  serveUrl?: string;

  get isImage() {
    return this.isFile && IMAGE_EXTS.filter(x => this.absolutePath.endsWith(x)).length > 0;
  }
}

@Injectable({
  providedIn: 'root'
})
export class FilesystemService {
  fsChange = new Subject<any>();

  constructor(private http: HttpClient) {
  }

  getItemsInPath(path: string): Observable<FSItem[]> {
    return this.http.get<any>(`${env.baseUrl}/rest/filesystem/list/?path=${path}`)
      .pipe(
        map(response => response.files),
        map(fileList => fileList.map(file =>
          Object.assign(
            new FSItem(),
            file
          )
        ))) as Observable<FSItem[]>;
  }

  getServeUrl(route: string, item: FSItem) {
    const path = Location.joinWithSlash(route, item.name);

    return `${env.baseUrl}/rest/filesystem/serve/?path=${path}`;
  }

  zipAndDownload(selected: FSItem[]) {
    const body = {
      files: selected.map(x => x.absolutePath)
    };

    return this.http.post<any>(`${env.baseUrl}/rest/filesystem/zipAndDownload/`, body);
  }

  delete(selected: FSItem[]) {
    const body = {
      files: selected.map(x => x.absolutePath)
    };

    return this.http.post<any>(`${env.baseUrl}/rest/filesystem/delete/`, body).pipe(tap(_ => this.fsChange.next()));
  }

  download(selected: FSItem[]) {
    return this.zipAndDownload(selected).pipe(
      tap(data => window.open(`${env.baseUrl}/rest/filesystem/serveAndDelete/?path=${data.absolutePath}`, '_blank'))
    );
  }

  mkdir(location: string, newFolderName: string) {
    const body = {
      name: Location.joinWithSlash(location, newFolderName)
    };

    return this.http.post<any>(`${env.baseUrl}/rest/filesystem/mkdir/`, body);
  }
}
