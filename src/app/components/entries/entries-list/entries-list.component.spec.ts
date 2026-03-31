import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntriesListComponent } from './entries-list.component';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Entry } from '../../../core/models';

const entries: Entry[] = [
      {
        id: "741",
        user_id: "852",
        content: "<b>abc</b>",
        content_text: "blablabla",
        created_at: "2024-02-02 11:11:11.456123",
        emotion_id: "789",
        updated_at: ""
      },
    {
        id: "123",
        user_id: "456",
        content: "<b>abc</b>",
        content_text: "abc",
        created_at: "2024-01-01 11:11:11.456123",
        emotion_id: "789",
        updated_at: ""
      }]

describe('EntriesListComponent', () => {
  let component: EntriesListComponent;
  let fixture: ComponentFixture<EntriesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntriesListComponent, NoopAnimationsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EntriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('When mounting component should show spinner at first', () => {
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('When mounting component, after showing spinner, should hide spinner and show entries', () => {
    //given    
    component.loading.set(false);
    component.entries.set(entries);
    

    //when
    fixture.detectChanges(); //Força o Angular a atualizar o DOM.

    // then
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    const divEmptyDiary = fixture.nativeElement.querySelector('#div-empty-diary');
    const divNoResult = fixture.nativeElement.querySelector('#div-no-result');
    const divShowEntries = fixture.nativeElement.querySelector('#div-show-entries');
    expect(spinner).toBeFalsy();
    expect(divEmptyDiary).toBeFalsy();
    expect(divNoResult).toBeFalsy();
    expect(divShowEntries).toBeTruthy();
    
  });

  it('Given empty list of entries, When mounting component, then should show option to register new entry', () => {
    //given
    component.entries.set([]);

    //when
    component.loading.set(false);
    fixture.detectChanges();

    //then
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    const divEmptyDiary = fixture.nativeElement.querySelector('#div-empty-diary');
    const divNoResult = fixture.nativeElement.querySelector('#div-no-result');
    expect(spinner).toBeFalsy();
    expect(divNoResult).toBeFalsy();
    expect(divEmptyDiary).toBeTruthy();

  });

  it('Given a valid list of entries, When searching term, then should show matching entries', () => {
     //given
    component.entries.set(entries);

    //when
    component.loading.set(false);
    component.searchTerm.set("abc");
    fixture.detectChanges();

    //then
    console.log(component.hasActiveFilters())
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    const divEmptyDiary = fixture.nativeElement.querySelector('#div-empty-diary');
    const divNoResult = fixture.nativeElement.querySelector('#div-no-result');
    const divShowEntries = fixture.nativeElement.querySelector('#div-show-entries');
    expect(spinner).toBeFalsy();
    expect(divNoResult).toBeFalsy();
    expect(divEmptyDiary).toBeFalsy();
    expect(divShowEntries).toBeTruthy();
  });

  it('Given no valid list of entries, When searching term, then text noticing your diary is empty', () => {
    //given
    component.entries.set([]);

    //when
    component.loading.set(false);
    component.searchTerm.set("abc");
    fixture.detectChanges();

    //then    
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    const divEmptyDiary = fixture.nativeElement.querySelector('#div-empty-diary');
    const divNoResult = fixture.nativeElement.querySelector('#div-no-result');
    const divShowEntries = fixture.nativeElement.querySelector('#div-show-entries');
    expect(spinner).toBeFalsy();
    expect(divEmptyDiary).toBeNull();
    expect(divShowEntries).toBeNull();
    expect(divNoResult).toBeTruthy();
  });
});
