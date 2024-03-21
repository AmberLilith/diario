import { Component, Input } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-delete-report',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './delete-report.component.html',
  styleUrl: './delete-report.component.css'
})
export class DeleteReportComponent {
  @Input() reportIdToDelete!: number

  constructor(private reportService: ReportService, private router: Router, private activatedRoute: ActivatedRoute){}

  ngOnInit():void{
    this.reportIdToDelete = parseInt(this.activatedRoute.snapshot.paramMap.get('id')!);
    document.getElementById('activateModal')!.click()
  }

  delete(): void {
    this.reportService.delete(this.reportIdToDelete).subscribe(() => {
      console.log(`Cliente com ID ${this.reportIdToDelete} excluído com sucesso.`);
      // Codigo abaixo é algo a ser feito após exclusão com sucesso como atualizar a lista de clientes após a exclusão ou redirecionar para outra tela
      this.router.navigate([''])
    },(error) => {
        console.error('Erro ao excluir cliente:', error);
      });
    }
}
