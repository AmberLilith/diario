import { DatePipe } from '@angular/common';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { QuillConfigModule } from 'ngx-quill';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    DatePipe,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(
      QuillConfigModule.forRoot({
        modules: {
          toolbar: false
        }
      })
    ),
  ],
};