import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('Given darkTheme When calling setTheme then attribute data-theme should be dark', () => {
    //given 
    const theme = "dark";

    //when
    (service as any).setTheme(theme)
    const localStorageValue = localStorage.getItem('theme');
    const docDataTheme = document.documentElement.getAttribute('data-theme');

    //then
    expect(localStorageValue).toBe(theme);
    expect(docDataTheme).toBe(theme);
  });


  it('Given lightTheme When calling setTheme then attribute data-theme should be light', () => {
    //given 
    const theme = "light";

    //when
    (service as any).setTheme(theme)
    const localStorageValue = localStorage.getItem('theme');
    const docDataTheme = document.documentElement.getAttribute('data-theme');

    //then
    expect(localStorageValue).toBe(theme);
    expect(docDataTheme).toBe(theme);
  });

  it('Given data-theme is light When calling toggle then attribute data-theme should be dark', () => {
    //given 
    (service as any).setTheme('light');


    //when
    (service as any).toggle();
    const localStorageValue = localStorage.getItem('theme');
    const docDataTheme = document.documentElement.getAttribute('data-theme');

    //then
    expect(localStorageValue).toBe('dark');
    expect(docDataTheme).toBe('dark');
  });

  it('Given data-theme is dark When calling toggle then attribute data-theme should be light', () => {
    //given 
    (service as any).setTheme('dark');

    //when
    (service as any).toggle();
    const localStorageValue = localStorage.getItem('theme');
    const docDataTheme = document.documentElement.getAttribute('data-theme');

    //then
    expect(localStorageValue).toBe('light');
    expect(docDataTheme).toBe('light');
  });

});

