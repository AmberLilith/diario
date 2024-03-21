import { Component, Input, Renderer2 } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReportComponent } from '../report/report.component';

@Component({
  selector: 'app-list-reports',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReportComponent
  ],
  templateUrl: './list-reports.component.html',
  styleUrl: './list-reports.component.css'
})
export class ListReportsComponent {
  @Input() reportsList: Report[] = []
  @Input() reportToEdit!: Report
  reportIdToDelete!: number

  constructor(private reportService: ReportService, private router: Router) { }

  listAll(): void {
    this.reportService.listAll().subscribe(reportsList => {
      console.log(reportsList)
      this.reportsList = reportsList
      //this.showReports()
    })
  }   


  ngOnInit(): void {
    this.listAll()    
  }

  navigateToEdit(id: number){
    this.router.navigate([`/edit/${id}`])
  }

  removeElementsFromElement(element: Element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }  
}
