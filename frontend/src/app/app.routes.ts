import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Store } from './store.service';
import { DashboardComponent, EmployeesComponent, SalariesComponent, LeavesComponent, UsersComponent, MyProfileComponent, MySalaryComponent } from './pages';

const role = (admin: boolean): CanActivateFn => () =>
  inject(Store).isAdmin === admin || inject(Router).createUrlTree(['/dashboard']);

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'employees', component: EmployeesComponent, canActivate: [role(true)] },
  { path: 'salaries', component: SalariesComponent, canActivate: [role(true)] },
  { path: 'leaves', component: LeavesComponent, canActivate: [role(true)], data: { admin: true } },
  { path: 'users', component: UsersComponent, canActivate: [role(true)] },
  { path: 'myprofile', component: MyProfileComponent, canActivate: [role(false)] },
  { path: 'mysalary', component: MySalaryComponent, canActivate: [role(false)] },
  { path: 'myleaves', component: LeavesComponent, canActivate: [role(false)], data: { admin: false } },
  { path: '**', redirectTo: 'dashboard' },
];
