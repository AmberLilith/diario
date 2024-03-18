import { Component, Input, Renderer2 } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-reports',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './list-reports.component.html',
  styleUrl: './list-reports.component.css'
})
export class ListReportsComponent {
  @Input() reportsList!: Report[]
  @Input() reportToEdit!: Report

  constructor(private reportService: ReportService, private renderer: Renderer2) { }

  listAll(): void {
    this.reportService.listAll().subscribe(reportsList => {
      this.reportsList = reportsList
      //this.showReports()
    })
  } 


  ngOnInit(): void {
    this.listAll()    
  }

  
  showReports() {
    for (let i = 0; i < this.reportsList.length; i += 3) {
      const divRow = document.createElement('div')
      divRow.id = `divRows${i}`
      divRow.classList.add('row')
      for (let j = i; j < this.reportsList.length && j < i + 3; j++) {
        const divCol = document.createElement('div')
        divCol.classList.add('col-sm-4')

        const divCard = document.createElement('div')
        divCard.className = 'card w-75 mb-3'

        const divCardBody = document.createElement('div')
        divCardBody.classList.add('card-body')

        const h5CardTitle = document.createElement('h5')
        h5CardTitle.classList.add('card-title')
        h5CardTitle.textContent = this.reportsList[j].date
        h5CardTitle.setAttribute('style',"display: flex; justify-content: space-between; align-items: center;")

        const linkEdit = this.renderer.createElement('a')
        this.renderer.setAttribute(linkEdit, 'idToEdit',this.reportsList[j].id.toString())
        this.renderer.setAttribute(linkEdit, 'href','#')
        const imageEdit = document.createElement('img')
        imageEdit.classList.add('imageOptions')
        imageEdit.setAttribute('src','/assets/edit.png')
        imageEdit.setAttribute('alt', 'Editar relato')
        imageEdit.setAttribute('data-toggle','modal')        
        imageEdit.setAttribute('data-target','#formModal')

        linkEdit.appendChild(imageEdit)
        h5CardTitle.appendChild(linkEdit)
        

        const linkDelete = document.createElement('a')
        linkDelete.setAttribute('idToDelete',this.reportsList[j].id.toString())
        linkDelete.setAttribute('href','#')

        const imageDelete = document.createElement('img')
        imageDelete.classList.add('imageOptions')
        imageDelete.setAttribute('src','/assets/delete.png')
        imageDelete.setAttribute('alt', 'Deletar relato')
        imageDelete.setAttribute('data-toggle','modal')
        imageDelete.setAttribute('data-target','#formModal')

        linkDelete.appendChild(imageDelete)
        h5CardTitle.appendChild(linkDelete)
         
        const paragraphCardText = document.createElement('p')
        paragraphCardText.classList.add('card-text')
        paragraphCardText.textContent = this.reportsList[j].report.slice(0,100) + " ..."

        divCardBody.appendChild(h5CardTitle)
        divCardBody.appendChild(paragraphCardText)

        divCard.appendChild(divCardBody)

        divCol.appendChild(divCard)

        divRow.appendChild(divCol)

      }

      document.getElementById('divReportList')!.appendChild(divRow)

    }


  }  

}
