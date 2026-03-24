/* import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntryFormComponent } from './entry-form.component';
import { EntriesService } from '../../../core/services/entries.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EntryFormComponent', () => {
  let component: EntryFormComponent;
  let fixture: ComponentFixture<EntryFormComponent>;
  let entriesServiceSpy: jasmine.SpyObj<EntriesService>;

  beforeEach(async () => {
    // 1. Criar um spy para o EntriesService
    const spy = jasmine.createSpyObj('EntriesService', ['getAllImgUrl']);

    await TestBed.configureTestingModule({
      declarations: [EntryFormComponent],
      providers: [
        { provide: EntriesService, useValue: spy }
      ],
      // NO_ERRORS_SCHEMA evita erros se você tiver outros componentes/diretivas no HTML
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EntryFormComponent);
    component = fixture.componentInstance;
    entriesServiceSpy = TestBed.inject(EntriesService) as jasmine.SpyObj<EntriesService>;

    // Mock inicial do dado que estaria "vindo do banco"
    component.entryToEdit = {
      photos_paths: ['storage/foto1.jpg', 'storage/foto2.jpg', 'storage/foto3.jpg']
    };

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // --- Testes para o método getImgUrlFromEditor ---
  describe('getImgUrlFromEditor()', () => {
    it('should return an array of URLs when the service finds images', () => {
      const mockContent = '<p>Algum conteúdo</p>';
      const mockUrls = ['http://site.com/img1.png', 'http://site.com/img2.png'];
      entriesServiceSpy.getAllImgUrl.and.returnValue(mockUrls);

      const result = component.getImgUrlFromEditor(mockContent);

      expect(result).toEqual(mockUrls);
      expect(entriesServiceSpy.getAllImgUrl).toHaveBeenCalledWith(mockContent);
    });

    it('should return null when the service returns null', () => {
      entriesServiceSpy.getAllImgUrl.and.returnValue(null);
      const result = component.getImgUrlFromEditor('');
      expect(result).toBeNull();
    });
  });

  // --- Testes para o método filterRemainingPhotos (Interseção) ---
  describe('filterRemainingPhotos()', () => {
    it('should return only photos that exist in both database and editor (intersection)', () => {
      // O editor contém uma foto antiga (1), uma antiga (3) e uma nova (nova.jpg)
      const remainUrlsFromEditor = [
        'storage/foto1.jpg', 
        'storage/foto3.jpg', 
        'storage/nova.jpg'
      ];

      const result = component.filterRemainingPhotos(remainUrlsFromEditor);

      // Deve retornar apenas o que já existia no banco
      expect(result).toEqual(['storage/foto1.jpg', 'storage/foto3.jpg']);
      expect(result).not.toContain('storage/nova.jpg');
    });

    it('should return an empty array if no original photos are kept', () => {
      const remainUrlsFromEditor = ['storage/nova_foto_apenas.jpg'];
      const result = component.filterRemainingPhotos(remainUrlsFromEditor);
      expect(result).toEqual([]);
    });

    it('should return an empty array if remainImgsUrls is null', () => {
      const result = component.filterRemainingPhotos(null);
      expect(result).toEqual([]);
    });

    it('should return an empty array if entryToEdit.photos_paths is undefined', () => {
      component.entryToEdit.photos_paths = undefined;
      const result = component.filterRemainingPhotos(['storage/foto1.jpg']);
      expect(result).toEqual([]);
    });
  });
}); */