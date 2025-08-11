import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { openverseReducer } from './pages/home-page/store/openverse.reducers';
import { OpenverseEffects } from './pages/home-page/store/openverse.effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { annotationsReducer } from './pages/home-page/store/annotations.reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({
      [openverseReducer.name]: openverseReducer.reducer,
      [annotationsReducer.name]: annotationsReducer.reducer,
    }),
    provideEffects(OpenverseEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};
