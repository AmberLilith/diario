import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryDetailComponent } from './entry-detail.component';

describe('EntryDetailComponent', () => {
  let component: EntryDetailComponent;
  let fixture: ComponentFixture<EntryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
