import { Component, Input } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Report } from '../../models/report';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-report',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './edit-report.component.html',
  styleUrl: './edit-report.component.css'
})
export class EditReportComponent {
  @Input() reportToEdit!: Report
  reportIdToEdit: any
  formEditReport!: FormGroup

  constructor(private reportService: ReportService,
     private activatedRoute: ActivatedRoute,
     private router: Router){
      this.startForm()
      
     }

     startForm(){
      this.formEditReport = new FormGroup({        
        report: new FormControl(this.reportToEdit ? this.reportToEdit.report : "", Validators.required),
        date: new FormControl(this.reportToEdit ? this.reportToEdit.date : "")
      })
     }


  ngOnInit(): void {
    this.reportIdToEdit = this.activatedRoute.snapshot.paramMap.get('id');
    this.getOne(this.reportIdToEdit)  
  }

  update() {
    this.reportService.update(this.reportIdToEdit, this.formEditReport.value)
      .subscribe(
        response => {
          console.log('Dados atualizados com sucesso:', response);
          console.log("Valores do form " + this.formEditReport.value)
          console.log("Valores de reportToEdit " + this.reportToEdit)
          this.router.navigate([''])
        },
        error => {
          console.error('Erro ao atualizar dados:', error);
        }
      );
  }




  getOne(id: number){
    this.reportService.getOne(id).
    subscribe(
      response => {
        this.reportToEdit = response
        this.startForm()
      },
      (error) => {
        console.error('Erro ao obter registro:', error);
      }
    );
  }

  setValuesToEdit(){
    document.getElementById('')!.innerHTML = ""
  }
  
}
