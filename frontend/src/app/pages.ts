import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from './store.service';
import { EmployeeModalComponent, EmployeeTableComponent, InrPipe, SalaryTableComponent, StatComponent } from './shared';

// ───────────────────────────── DASHBOARD ─────────────────────────────
@Component({
  selector: 'app-dashboard', standalone: true,
  imports: [CommonModule, InrPipe, StatComponent, EmployeeTableComponent, EmployeeModalComponent],
  template: `
<div class="page-head"><div><h1>Dashboard</h1><p>Welcome back, {{s.session.name}}. Here is your workspace overview.</p></div></div>
<div class="stats">
  <div class="stat" [appStat]="s.isAdmin ? 'Total employees' : 'My employee profile'" [value]="s.isAdmin ? s.employees.length : mine.length"></div>
  <div class="stat" appStat="Salary records" [value]="sal.length"></div>
  <div class="stat" appStat="Pending leave requests" [value]="pending"></div>
  <div class="stat" [appStat]="s.isAdmin ? 'Registered accounts' : 'My salary total'" [value]="s.isAdmin ? s.users.length : (total | inr)"></div>
</div>
<div class="panel">
  <div class="panel-head"><h3>{{s.isAdmin ? 'Recently added employees' : 'My profile'}}</h3>
    <button *ngIf="s.isAdmin" class="primary small" (click)="open(null)">+ Add employee</button></div>
  <app-employee-table *ngIf="s.isAdmin" [list]="recent" (edit)="open($event)"></app-employee-table>
  <div *ngIf="!s.isAdmin" class="profile">
    <div><small>Full name</small><strong>{{s.session.name}}</strong></div>
    <div><small>Email</small><strong>{{s.session.email}}</strong></div>
    <div><small>Role</small><strong>Employee</strong></div>
    <div><small>Salary records</small><strong>{{sal.length}}</strong></div>
  </div>
</div>
<app-employee-modal *ngIf="modal" [employee]="editing" (closed)="modal=false"></app-employee-modal>`,
})
export class DashboardComponent {
  modal = false; editing: any = null;
  constructor(public s: Store) {}
  get mine() { return this.s.employees.filter(e => e.userId === this.s.session.id); }
  get sal() { return this.s.isAdmin ? this.s.salaries : this.s.salaries.filter(x => x.userId === this.s.session.id); }
  get lv() { return this.s.isAdmin ? this.s.leaves : this.s.leaves.filter(l => l.userId === this.s.session.id); }
  get pending() { return this.lv.filter(l => l.status === 'Pending').length; }
  get total() { return this.sal.reduce((a, x) => a + Number(x.netSalary || 0), 0); }
  get recent() { return this.s.employees.slice(-5).reverse(); }
  open(id: string | null) { this.editing = id ? this.s.employees.find(e => e.id === id) : null; this.modal = true; }
}

// ───────────────────────────── EMPLOYEES ─────────────────────────────
@Component({
  selector: 'app-employees', standalone: true,
  imports: [CommonModule, FormsModule, EmployeeTableComponent, EmployeeModalComponent],
  template: `
<div class="page-head"><div><h1>Employees</h1><p>Create, view, update, and remove employee records.</p></div><button class="primary" (click)="open(null)">+ Add employee</button></div>
<div class="panel">
  <div class="panel-head"><h3>Employee directory ({{s.employees.length}})</h3><input class="search" [(ngModel)]="q" placeholder="Search name, email, department…"></div>
  <app-employee-table [list]="list" (edit)="open($event)"></app-employee-table>
</div>
<app-employee-modal *ngIf="modal" [employee]="editing" (closed)="modal=false"></app-employee-modal>`,
})
export class EmployeesComponent {
  q = ''; modal = false; editing: any = null;
  constructor(public s: Store) {}
  get list() {
    const q = this.q.toLowerCase();
    return this.s.employees.filter(e => (e.name + ' ' + e.email + ' ' + e.department + ' ' + e.position).toLowerCase().includes(q)).reverse();
  }
  open(id: string | null) { this.editing = id ? this.s.employees.find(e => e.id === id) : null; this.modal = true; }
}

// ───────────────────────────── SALARIES ─────────────────────────────
@Component({
  selector: 'app-salaries', standalone: true,
  imports: [CommonModule, FormsModule, InrPipe, StatComponent, SalaryTableComponent],
  template: `
<div class="page-head"><div><h1>Salary &amp; Payroll</h1><p>Add salary records and review payroll history.</p></div><button class="primary" (click)="open()">+ Add salary</button></div>
<div class="stats">
  <div class="stat" appStat="Salary records" [value]="s.salaries.length"></div>
  <div class="stat" appStat="Total net payroll" [value]="total | inr"></div>
  <div class="stat" appStat="Employees paid" [value]="paid"></div>
  <div class="stat" appStat="This month" [value]="thisMonth"></div>
</div>
<div class="panel">
  <div class="panel-head"><h3>Salary records</h3><input class="search" [(ngModel)]="q" placeholder="Search employee or month…"></div>
  <app-salary-table [list]="list"></app-salary-table>
</div>
<div class="modal-backdrop" *ngIf="modal"><div class="modal">
  <div class="modal-head"><h3>Add salary record</h3><button class="close" (click)="modal=false">✕</button></div>
  <form (ngSubmit)="save()" ngNativeValidate>
    <div class="form-grid">
      <div class="field"><label>Employee *</label><select name="employeeId" required [(ngModel)]="f.employeeId"><option *ngFor="let e of s.employees" [value]="e.id">{{e.name}} ({{e.email}})</option></select></div>
      <div class="field"><label>Salary month *</label><input name="month" type="month" required [(ngModel)]="f.month"></div>
      <div class="field"><label>Basic salary (₹) *</label><input name="basic" type="number" min="0" step="any" required [(ngModel)]="f.basic"></div>
      <div class="field"><label>Allowance (₹)</label><input name="allowance" type="number" min="0" step="any" [(ngModel)]="f.allowance"></div>
      <div class="field"><label>Deductions (₹)</label><input name="deductions" type="number" min="0" step="any" [(ngModel)]="f.deductions"></div>
    </div>
    <div class="form-actions"><button class="primary" type="submit">Save salary</button><button class="secondary" type="button" (click)="modal=false">Cancel</button></div>
  </form>
</div></div>`,
})
export class SalariesComponent {
  q = ''; modal = false; f: any = {};
  constructor(public s: Store) {}
  get list() { const q = this.q.toLowerCase(); return this.s.salaries.filter(x => (x.employeeName + ' ' + x.month).toLowerCase().includes(q)).reverse(); }
  get total() { return this.s.salaries.reduce((a, x) => a + Number(x.netSalary || 0), 0); }
  get paid() { return new Set(this.s.salaries.map(x => x.userId || x.employeeId)).size; }
  get thisMonth() { const m = new Date().toISOString().slice(0, 7); return this.s.salaries.filter(x => x.month === m).length; }
  open() {
    if (!this.s.employees.length) return this.s.toast('Add an employee record before adding salary.');
    this.f = { employeeId: this.s.employees[0].id, month: new Date().toISOString().slice(0, 7), basic: 0, allowance: 0, deductions: 0 };
    this.modal = true;
  }
  save() {
    const b = Number(this.f.basic) || 0, a = Number(this.f.allowance) || 0, d = Number(this.f.deductions) || 0;
    if (d > b + a) return this.s.toast('Deductions cannot exceed gross salary.');
    this.s.run(this.s.http.post('/api/salaries', { employeeId: this.f.employeeId, month: this.f.month, basic: b, allowance: a, deductions: d }), 'Salary record saved.', () => (this.modal = false));
  }
}

// ───────────────────────────── LEAVES (admin + employee) ─────────────────────────────
@Component({
  selector: 'app-leaves', standalone: true, imports: [CommonModule, FormsModule],
  template: `
<div class="page-head"><div><h1>{{admin ? 'Leave Requests' : 'My Leave Requests'}}</h1>
  <p>{{admin ? 'Review and approve or reject employee leave requests.' : 'Submit a leave request and track its status.'}}</p></div>
  <button *ngIf="!admin" class="primary" (click)="open()">+ Request leave</button></div>
<div class="panel">
  <div class="panel-head"><h3>{{admin ? 'All requests' : 'My requests'}} ({{list.length}})</h3></div>
  <div class="empty" *ngIf="!list.length">No leave requests yet.</div>
  <div class="table-wrap" *ngIf="list.length"><table>
    <thead><tr><th>Employee</th><th>Leave dates</th><th>Reason</th><th>Requested on</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody><tr *ngFor="let l of list">
      <td>{{l.employeeName}}</td>
      <td>{{l.fromDate | date:'dd MMM yyyy'}} – {{l.toDate | date:'dd MMM yyyy'}}</td>
      <td>{{l.reason}}</td>
      <td>{{l.created | date:'dd MMM yyyy'}}</td>
      <td><span class="badge" [ngClass]="l.status==='Approved'?'active':(l.status==='Rejected'?'inactive':'pending')">{{l.status}}</span></td>
      <td><div class="actions" *ngIf="admin && l.status==='Pending'; else dash">
        <button class="secondary small" (click)="setStatus(l,'Approved')">Approve</button>
        <button class="danger small" (click)="setStatus(l,'Rejected')">Reject</button></div>
        <ng-template #dash>—</ng-template></td>
    </tr></tbody>
  </table></div>
</div>
<div class="modal-backdrop" *ngIf="modal"><div class="modal">
  <div class="modal-head"><h3>Request leave</h3><button class="close" (click)="modal=false">✕</button></div>
  <form (ngSubmit)="save()" ngNativeValidate>
    <div class="form-grid">
      <div class="field"><label>From date *</label><input name="fromDate" type="date" required [(ngModel)]="f.fromDate"></div>
      <div class="field"><label>To date *</label><input name="toDate" type="date" required [(ngModel)]="f.toDate"></div>
      <div class="field" style="grid-column:1/-1"><label>Reason *</label><input name="reason" required maxlength="250" placeholder="Brief reason for leave" [(ngModel)]="f.reason"></div>
    </div>
    <div class="form-actions"><button class="primary" type="submit">Submit request</button><button class="secondary" type="button" (click)="modal=false">Cancel</button></div>
  </form>
</div></div>`,
})
export class LeavesComponent {
  admin: boolean; modal = false; f: any = {};
  constructor(public s: Store, route: ActivatedRoute) { this.admin = !!route.snapshot.data['admin']; }
  get list() { return (this.admin ? this.s.leaves : this.s.leaves.filter(l => l.userId === this.s.session.id)).slice().reverse(); }
  open() { this.f = { fromDate: '', toDate: '', reason: '' }; this.modal = true; }
  

save() {
  const fromDate = String(this.f.fromDate || '').trim();
  const toDate = String(this.f.toDate || '').trim();
  const reason = String(this.f.reason || '').trim();

  if (!fromDate || !toDate || !reason) {
    this.s.toast('Please fill all required fields.');
    return;
  }

  // Convert dates to comparable YYYY-MM-DD format
  const parseDate = (value: string): string => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return '';
  };

  const start = parseDate(fromDate);
  const end = parseDate(toDate);

  if (!start || !end) {
    this.s.toast('Please select valid From and To dates.');
    return;
  }

  if (end < start) {
    this.s.toast('To date must be on or after From date.');
    return;
  }

  this.s.run(
    this.s.http.post('/api/leaves', {
      fromDate: start,
      toDate: end,
      reason
    }),
    'Leave request submitted successfully.',
    () => {
      this.modal = false;
      this.f = {
        fromDate: '',
        toDate: '',
        reason: ''
      };
    }
  );
}


}

// ───────────────────────────── ACCOUNTS ─────────────────────────────
@Component({
  selector: 'app-users', standalone: true, imports: [CommonModule],
  template: `
<div class="page-head"><div><h1>Accounts</h1><p>Registered demo accounts and their assigned roles.</p></div></div>
<div class="panel">
  <div class="panel-head"><h3>Accounts ({{s.users.length}})</h3></div>
  <div class="empty" *ngIf="!s.users.length">No accounts registered.</div>
  <div class="table-wrap" *ngIf="s.users.length"><table>
    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Registered</th></tr></thead>
    <tbody><tr *ngFor="let u of s.users"><td>{{u.name}}</td><td>{{u.email}}</td><td><span class="badge">{{u.role.toUpperCase()}}</span></td><td>{{u.createdAt | date:'dd/MM/yyyy'}}</td></tr></tbody>
  </table></div>
  <div style="padding:14px 18px;color:#9b6200;font-size:12px">Demo-only accounts are stored in the backend database. Passwords are not securely hashed.</div>
</div>`,
})
export class UsersComponent { constructor(public s: Store) {} }

// ───────────────────────────── MY PROFILE ─────────────────────────────
@Component({
  selector: 'app-my-profile', standalone: true, imports: [CommonModule],
  template: `
<div class="page-head"><div><h1>My Profile</h1><p>View your employee details.</p></div></div>
<div class="panel"><div class="profile"><div *ngFor="let kv of rows"><small>{{kv[0]}}</small><strong>{{kv[1]}}</strong></div></div></div>`,
})
export class MyProfileComponent {
  constructor(public s: Store) {}
  get rows() {
    const se = this.s.session, e = this.s.employees.find(x => x.userId === se.id) || ({} as any);
    return [
      ['Full name', e.name || se.name], ['Email', e.email || se.email],
      ['Department', e.department || 'Not assigned'], ['Position', e.position || 'Not assigned'],
      ['Phone', e.phone || 'Not provided'],
      ['Joining date', e.joiningDate ? formatDate(e.joiningDate, 'dd MMM yyyy', 'en-US') : '—'],
      ['Employment status', e.status || 'Not assigned'], ['Account role', 'Employee'],
    ];
  }
}

// ───────────────────────────── MY SALARY ─────────────────────────────
@Component({
  selector: 'app-my-salary', standalone: true,
  imports: [CommonModule, InrPipe, StatComponent, SalaryTableComponent],
  template: `
<div class="page-head"><div><h1>My Salary</h1><p>Review salary records associated with your account.</p></div></div>
<div class="stats">
  <div class="stat" appStat="Salary records" [value]="list.length"></div>
  <div class="stat" appStat="Total net salary" [value]="total | inr"></div>
  <div class="stat" appStat="Latest month" [value]="list.length ? list[list.length-1].month : '—'"></div>
</div>
<div class="panel"><app-salary-table [list]="rev" [mine]="true"></app-salary-table></div>`,
})
export class MySalaryComponent {
  constructor(public s: Store) {}
  get list() {
    const emp = this.s.employees.find(e => e.userId === this.s.session.id);
    return this.s.salaries.filter(x => x.userId === this.s.session.id || (emp && x.employeeId === emp.id));
  }
  get rev() { return this.list.slice().reverse(); }
  get total() { return this.list.reduce((a, x) => a + Number(x.netSalary || 0), 0); }
}
