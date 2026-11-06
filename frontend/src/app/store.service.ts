import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap, tap } from 'rxjs';

/** Holds the logged-in session + all data (same role as `db` and `session` in the HTML version). */
@Injectable({ providedIn: 'root' })
export class Store {
  session: any = null;
  authMode: 'register' | 'login' = 'register';
  users: any[] = [];
  employees: any[] = [];
  salaries: any[] = [];
  leaves: any[] = [];
  toastMsg = '';
  private timer: any;

  constructor(public http: HttpClient) {}

  get isAdmin(): boolean { return this.session?.role === 'admin'; }

  toast(m: string, ms = 3000) {
    this.toastMsg = m;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => (this.toastMsg = ''), ms);
  }

  err(e: any) {
    console.error('API error', e);
    if (e?.status === 0) return this.toast('Cannot reach backend. Start the Spring Boot app on port 8080.', 8000);
    this.toast(e?.error?.message || ('Error ' + e?.status + ': ' + (e?.error?.error || e?.statusText || 'request failed')), 8000);
  }

  load(): Observable<any> {
    return forkJoin({
      users: this.http.get<any[]>('/api/users'),
      employees: this.http.get<any[]>('/api/employees'),
      salaries: this.http.get<any[]>('/api/salaries'),
      leaves: this.http.get<any[]>('/api/leaves'),
    }).pipe(tap(r => {
      this.users = r.users; this.employees = r.employees;
      this.salaries = r.salaries; this.leaves = r.leaves;
    }));
  }

  /** Run a write request, reload all data, then show toast. */
  run(req: Observable<any>, msg: string, done?: () => void) {
    req.pipe(switchMap(() => this.load())).subscribe({
      next: () => { done?.(); this.toast(msg); },
      error: e => this.err(e),
    });
  }
}
