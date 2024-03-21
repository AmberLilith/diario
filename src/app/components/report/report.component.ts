import { Component, Input } from '@angular/core';
import { Report } from '../../models/report';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  @Input() report!: Report
}
