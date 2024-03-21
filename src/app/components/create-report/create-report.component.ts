import { Component } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './create-report.component.html',
  styleUrl: './create-report.component.css'
})
export class CreateReportComponent {
  formCreateReport!: FormGroup 

  constructor(private reportService: ReportService, private router: Router){
    this.startForm()
  }

  getCurrentDate(): string{
   let date =  new Date()
   let currentDay = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate() 
   let currentMonth = (date.getMonth() < 9) ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
   let currentYear = date.getUTCFullYear()
   let currentHours = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours() 
   let currentMinutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes()
   let currentSeconds = (date.getSeconds() < 10) ? "0" + date.getSeconds() : date.getSeconds()
    return  currentDay + "/" + currentMonth + "/" + currentYear + " - " + currentHours + ":" + currentMinutes + ":" + currentSeconds
  }

  startForm(){
    this.formCreateReport = new FormGroup({        
      report: new FormControl("", Validators.required),
      date: new FormControl(this.getCurrentDate())
    })
   }

  
   create(){
    return this.reportService.create(this.formCreateReport.value).subscribe(report =>{
      this.formCreateReport.reset()
      this.router.navigate([''])
    })
  }

}
