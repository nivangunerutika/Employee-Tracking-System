import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from './store.service';
import { AuthComponent } from './auth.component';

const ADMIN_NAV = [['dashboard', '▦', 'Dashboard'], ['employees', '♙', 'Employees'], ['salaries', '₹', 'Salary & Payroll'], ['leaves', '◷', 'Leave Requests'], ['users', '☷', 'Accounts']];
const EMP_NAV = [['dashboard', '▦', 'Dashboard'], ['myprofile', '♙', 'My Profile'], ['mysalary', '₹', 'My Salary'], ['myleaves', '◷', 'My Leave Requests']];

@Component({
  selector: 'app-root', standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AuthComponent],
  template: `
<app-auth *ngIf="!s.session"></app-auth>
<section class="app" *ngIf="s.session">
  <header class="topbar">
    <div class="brand"><span class="logo">EM</span> PeopleDesk</div>
    <div class="userline"><span>{{s.session.name}}</span><span class="badge">{{s.session.role.toUpperCase()}}</span><button class="secondary small" (click)="logout()">Logout</button></div>
  </header>
  <div class="layout">
    <aside class="sidebar"><div class="nav-label">Workspace</div>
      <div><button *ngFor="let n of nav" class="navbtn" [routerLink]="'/' + n[0]" routerLinkActive="active"><span>{{n[1]}}</span>{{n[2]}}</button></div>
    </aside>
    <main class="main"><router-outlet></router-outlet></main>
  </div>
</section>
<div class="toast" *ngIf="s.toastMsg">{{s.toastMsg}}</div>`,
})
export class AppComponent {
  constructor(public s: Store, private router: Router) {}
  get nav() { return this.s.isAdmin ? ADMIN_NAV : EMP_NAV; }
  logout() {
    this.s.session = null;
    this.s.authMode = 'login';
    this.router.navigate(['/']);
  }
}
