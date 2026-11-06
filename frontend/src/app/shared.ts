import { Component, Directive, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from './store.service';

@Pipe({ name: 'inr', standalone: true })
export class InrPipe implements PipeTransform {
  transform(n: any) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(n) || 0);
  }
}

/** <div class="stat" [appStat]="'Label'" [value]="123"></div> */
@Component({
  selector: '[appStat]', standalone: true,
  template: `<div class="label">{{appStat}}</div><div class="number">{{value}}</div>`,
})
export class StatComponent { @Input() appStat = ''; @Input() value: any = ''; }

@Component({
  selector: 'app-employee-table', standalone: true, imports: [CommonModule],
  template: `
  <div class="empty" *ngIf="!list.length">No employee records yet. Use “Add employee” to create the first record.</div>
  <div class="table-wrap" *ngIf="list.length"><table>
    <thead><tr><th>Employee</th><th>Department</th><th>Position</th><th>Joining date</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      <tr *ngFor="let e of list">
        <td><strong>{{e.name}}</strong><br><span class="muted">{{e.email}}</span></td>
        <td>{{e.department || '—'}}</td>
        <td>{{e.position || '—'}}</td>
        <td>{{e.joiningDate ? (e.joiningDate | date:'dd MMM yyyy') : '—'}}</td>
        <td><span class="badge" [ngClass]="e.status==='Active'?'active':'inactive'">{{e.status || 'Active'}}</span></td>
        <td><div class="actions">
          <button class="secondary small" (click)="edit.emit(e.id)">Edit</button>
          <button class="danger small" (click)="remove(e)">Delete</button>
        </div></td>
      </tr>
    </tbody>
  </table></div>`,
})
export class EmployeeTableComponent {
  @Input() list: any[] = [];
  @Output() edit = new EventEmitter<string>();
  constructor(private s: Store) {}
  remove(e: any) {
    if (confirm('Delete employee ' + e.name + '? Salary and leave history will remain.'))
      this.s.run(this.s.http.delete('/api/employees/' + e.id), 'Employee deleted.');
  }
}

@Component({
  selector: 'app-employee-modal', standalone: true, imports: [CommonModule, FormsModule],
  template: `
  <div class="modal-backdrop"><div class="modal">
    <div class="modal-head"><h3>{{employee ? 'Edit employee' : 'Add employee'}}</h3><button class="close" (click)="closed.emit()">✕</button></div>
    <form (ngSubmit)="save()" ngNativeValidate>
      <div class="form-grid">
        <div class="field"><label>Full name *</label><input name="name" required maxlength="80" [(ngModel)]="f.name"></div>
        <div class="field"><label>Email *</label><input name="email" type="email" required [(ngModel)]="f.email"></div>
        <div class="field"><label>Department</label><input name="department" [(ngModel)]="f.department"></div>
        <div class="field"><label>Position</label><input name="position" [(ngModel)]="f.position"></div>
        <div class="field"><label>Phone</label><input name="phone" [(ngModel)]="f.phone"></div>
        <div class="field"><label>Joining date</label><input name="joiningDate" type="date" [(ngModel)]="f.joiningDate"></div>
        <div class="field"><label>Status</label><select name="status" [(ngModel)]="f.status"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
        <div class="field"><label>Link account (optional)</label>
          <select name="userId" [(ngModel)]="f.userId"><option value="">No linked account</option>
            <option *ngFor="let u of linkable" [value]="u.id">{{u.name}} — {{u.email}}</option></select></div>
      </div>
      <div class="form-actions"><button class="primary" type="submit">Save employee</button><button class="secondary" type="button" (click)="closed.emit()">Cancel</button></div>
    </form>
  </div></div>`,
})
export class EmployeeModalComponent implements OnInit {
  @Input() employee: any = null;
  @Output() closed = new EventEmitter<void>();
  f: any = {};
  constructor(public s: Store) {}
  get linkable() { return this.s.users.filter(u => u.role === 'employee'); }
  ngOnInit() {
    const e = this.employee || {};
    this.f = {
      name: e.name || '', email: e.email || '', department: e.department || '', position: e.position || '',
      phone: e.phone || '', joiningDate: e.joiningDate || new Date().toISOString().slice(0, 10),
      status: e.status || 'Active', userId: e.userId || '',
    };
  }
  save() {
    const d = { ...this.f, email: this.f.email.trim().toLowerCase() };
    const req = this.employee
      ? this.s.http.put('/api/employees/' + this.employee.id, d)
      : this.s.http.post('/api/employees', d);
    this.s.run(req, 'Employee record saved successfully.', () => this.closed.emit());
  }
}

@Component({
  selector: 'app-salary-table', standalone: true, imports: [CommonModule, InrPipe],
  template: `
  <div class="empty" *ngIf="!list.length">No salary records yet. Add a salary record to begin.</div>
  <div class="table-wrap" *ngIf="list.length"><table>
    <thead><tr><th>Employee</th><th>Month</th><th>Basic salary</th><th>Allowance</th><th>Deductions</th><th>Net salary</th><th *ngIf="!mine">Actions</th></tr></thead>
    <tbody><tr *ngFor="let x of list">
      <td>{{mine ? 'My salary' : x.employeeName}}</td><td>{{x.month}}</td><td>{{x.basic | inr}}</td><td>{{x.allowance | inr}}</td><td>{{x.deductions | inr}}</td>
      <td><strong>{{x.netSalary | inr}}</strong></td>
      <td *ngIf="!mine"><button class="danger small" (click)="remove(x)">Delete</button></td>
    </tr></tbody>
  </table></div>`,
})
export class SalaryTableComponent {
  @Input() list: any[] = [];
  @Input() mine = false;
  constructor(private s: Store) {}
  remove(x: any) {
    if (confirm('Delete this salary record?'))
      this.s.run(this.s.http.delete('/api/salaries/' + x.id), 'Salary record deleted.');
  }
}
