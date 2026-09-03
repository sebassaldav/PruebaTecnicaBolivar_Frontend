import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: 'login',
        loadChildren: () => 
            import('./features/login/login')
                .then(m => m.Login)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
