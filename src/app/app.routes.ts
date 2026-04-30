import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./todo/todo-board').then((m) => m.TodoBoard),
  },
];
