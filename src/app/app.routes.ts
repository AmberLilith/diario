import { Routes } from '@angular/router';
import { CreateReportComponent } from './components/create-report/create-report.component';
import { EditReportComponent } from './components/edit-report/edit-report.component';
import { ListReportsComponent } from './components/list-reports/list-reports.component';
import { DeleteReportComponent } from './components/delete-report/delete-report.component';

export const routes: Routes = [
    {
        component: ListReportsComponent,
        path: "",
        pathMatch: 'full'        
    },
    {
        component: CreateReportComponent,
        path: "create",        
    },
    {
        component: EditReportComponent,
        path: "edit/:id"        
    },
    {
        component: DeleteReportComponent,
        path: "delete/:id"        
    }
];
