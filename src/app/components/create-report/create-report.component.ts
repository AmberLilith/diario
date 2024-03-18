import { Component } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report';

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [],
  templateUrl: './create-report.component.html',
  styleUrl: './create-report.component.css'
})
export class CreateReportComponent {

  constructor(private reportService: ReportService){}
  

  ngOnInit():void{
    //this.getOne
  }

}
