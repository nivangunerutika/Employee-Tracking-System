import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from './store.service';

@Component({
  selector: 'app-auth', standalone: true, imports: [CommonModule, FormsModule],
  template: `
<section class="auth-wrap">
  <div class="hero"><span class="pill">● PEOPLE • PAYROLL • PRODUCTIVITY</span><h1>Manage your team.<br>Move work forward.</h1><p>A simple Employee Management System demo with separate Admin and Employee workspaces, employee records, salary tracking, and leave requests.</p></div>
  <div class="auth-side"><div class="auth-card">
    <div *ngIf="s.authMode==='register'">
      <h2>Create an account</h2><p class="muted">Register to get started with your workspace.</p>
      <form (ngSubmit)="register()" ngNativeValidate>
        <div class="field"><label>Full name</label><input name="name" required placeholder="Your full name" maxlength="80" [(ngModel)]="reg.name"></div>
        <div class="field"><label>Email address</label><input name="email" type="email" required placeholder="you@example.com" maxlength="120" [(ngModel)]="reg.email"></div>
        <div class="field"><label>Password</label><input name="password" type="password" required minlength="4" placeholder="At least 4 characters" [(ngModel)]="reg.password"></div>
        <div class="field"><label>Register as</label><select name="role" [(ngModel)]="reg.role"><option value="employee">Employee</option><option value="admin">Admin (demo)</option></select></div>
        <button class="primary" type="submit">Create account</button>
      </form>
      <div class="auth-switch">Already have an account? <button class="link" (click)="s.authMode='login'">Login</button></div>
      <div class="notice"><strong>Demo note:</strong> This demo saves data in the backend database. Do not use real passwords or sensitive employee data.</div>
    </div>
    <div *ngIf="s.authMode==='login'">
      <h2>Welcome back</h2><p class="muted">Login to your Employee Management workspace.</p>
      <form (ngSubmit)="login()" ngNativeValidate>
        <div class="field"><label>Email address</label><input name="email" type="email" required placeholder="you@example.com" [(ngModel)]="log.email"></div>
        <div class="field"><label>Password</label><input name="password" type="password" required placeholder="Your password" [(ngModel)]="log.password"></div>
        <button class="primary" type="submit">Login</button>
      </form>
      <div class="auth-switch">New here? <button class="link" (click)="s.authMode='register'">Create an account</button></div>
      <div class="notice">For a quick demo, register an account and choose Admin or Employee. This is a prototype, not secure authentication.</div>
    </div>
  </div></div>
</section>`,
})
export class AuthComponent {
  reg = { name: '', email: '', password: '', role: 'employee' };
  log = { email: '', password: '' };
  constructor(public s: Store, private router: Router) {}

  register() {
    this.s.http.post('/api/auth/register', this.reg).subscribe({
      next: () => {
        this.log.email = this.reg.email.trim().toLowerCase();
        this.reg = { name: '', email: '', password: '', role: 'employee' };
        this.s.toast('Account created. Please login.');
        this.s.authMode = 'login';
      },
      error: e => this.s.err(e),
    });
  }

  login() {
    this.s.http.post<any>('/api/auth/login', this.log).subscribe({
      next: user => this.s.load().subscribe({
        next: () => {
          this.s.session = user;
          this.log = { email: '', password: '' };
          this.router.navigate(['/dashboard']);
        },
        error: e => this.s.err(e),
      }),
      error: e => this.s.err(e),
    });
  }
}
