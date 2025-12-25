import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

describe('errorInterceptor', () => {
  let toastService: jest.Mocked<ToastService>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let mockRequest: HttpRequest<any>;

  beforeEach(() => {
    // Create mock services
    toastService = {
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
      dismiss: jest.fn(),
      dismissAll: jest.fn(),
    } as any;

    authService = {
      logout: jest.fn(),
    } as any;

    router = {
      navigate: jest.fn().mockResolvedValue(true),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastService, useValue: toastService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });

    // Create a mock HTTP request
    mockRequest = new HttpRequest('GET', '/api/events');

    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should handle status 0 error (server unavailable)', (done) => {
    const error = new HttpErrorResponse({
      error: null,
      status: 0,
      statusText: 'Unknown Error',
      url: '/api/events'
    });

    const mockNext = jest.fn().mockReturnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockRequest, mockNext).subscribe({
        error: (err) => {
          // Verify logout was called
          expect(authService.logout).toHaveBeenCalledTimes(1);

          // Verify ONE toast was shown
          expect(toastService.error).toHaveBeenCalledTimes(1);
          expect(toastService.error).toHaveBeenCalledWith(
            'Serveur indisponible',
            'Vous avez été déconnecté suite à l\'indisponibilité du serveur.',
            10000
          );

          // Verify redirect to login
          expect(router.navigate).toHaveBeenCalledWith(['/login']);

          done();
        }
      });
    });
  });

  it('should handle 401 error with toast', (done) => {
    const error = new HttpErrorResponse({
      error: { error: { message: 'Session expirée' } },
      status: 401,
      statusText: 'Unauthorized',
      url: '/api/events'
    });

    const mockNext = jest.fn().mockReturnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockRequest, mockNext).subscribe({
        error: (err) => {
          // Verify toast was shown
          expect(toastService.error).toHaveBeenCalledWith(
            'Non autorisé',
            'Votre session a expiré. Veuillez vous reconnecter.',
            7000
          );

          // Verify NO logout or redirect
          expect(authService.logout).not.toHaveBeenCalled();
          expect(router.navigate).not.toHaveBeenCalled();

          done();
        }
      });
    });
  });

  it('should handle 403 error without toast (handled upstream)', (done) => {
    const error = new HttpErrorResponse({
      error: null,
      status: 403,
      statusText: 'Forbidden',
      url: '/api/admin/users'
    });

    const mockNext = jest.fn().mockReturnValue(throwError(() => error));
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockRequest, mockNext).subscribe({
        error: (err) => {
          // Verify console.warn was called (403 are logged but no toast)
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            '403 Forbidden: Permissions insuffisantes pour cette action'
          );

          // Verify NO toast shown (403 handled upstream)
          expect(toastService.error).not.toHaveBeenCalled();

          // Verify NO logout or redirect
          expect(authService.logout).not.toHaveBeenCalled();
          expect(router.navigate).not.toHaveBeenCalled();

          consoleWarnSpy.mockRestore();
          done();
        }
      });
    });
  });

  it('should handle 404 error with custom message if available', (done) => {
    const error = new HttpErrorResponse({
      error: { error: { message: 'Release introuvable' } },
      status: 404,
      statusText: 'Not Found',
      url: '/api/releases/unknown'
    });

    const mockNext = jest.fn().mockReturnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockRequest, mockNext).subscribe({
        error: (err) => {
          // Verify toast with custom message
          expect(toastService.error).toHaveBeenCalledWith(
            'Ressource introuvable',
            'Release introuvable',
            7000
          );

          done();
        }
      });
    });
  });

  it('should handle 500 error with toast', (done) => {
    const error = new HttpErrorResponse({
      error: null,
      status: 500,
      statusText: 'Internal Server Error',
      url: '/api/events'
    });

    const mockNext = jest.fn().mockReturnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockRequest, mockNext).subscribe({
        error: (err) => {
          // Verify toast was shown
          expect(toastService.error).toHaveBeenCalledWith(
            'Erreur serveur',
            'Une erreur interne est survenue sur le serveur.',
            7000
          );

          done();
        }
      });
    });
  });

  it('should pass through successful responses without modification', (done) => {
    const mockResponse = { data: 'success' };
    const mockNext = jest.fn().mockReturnValue(of(mockResponse));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockRequest, mockNext).subscribe({
        next: (response) => {
          // Verify response passed through
          expect(response).toEqual(mockResponse);

          // Verify no error handling was triggered
          expect(toastService.error).not.toHaveBeenCalled();
          expect(authService.logout).not.toHaveBeenCalled();
          expect(router.navigate).not.toHaveBeenCalled();

          done();
        }
      });
    });
  });

  it('should handle default error codes with generic message', (done) => {
    const error = new HttpErrorResponse({
      error: { error: { message: 'Custom error message' } },
      status: 502,
      statusText: 'Bad Gateway',
      url: '/api/events'
    });

    const mockNext = jest.fn().mockReturnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockRequest, mockNext).subscribe({
        error: (err) => {
          // Verify toast was shown with custom message
          expect(toastService.error).toHaveBeenCalledWith(
            'Erreur 502',
            'Custom error message',
            7000
          );

          done();
        }
      });
    });
  });

  it('should handle 404 error with default message if no custom message', (done) => {
    const error = new HttpErrorResponse({
      error: null,
      status: 404,
      statusText: 'Not Found',
      url: '/api/releases/unknown'
    });

    const mockNext = jest.fn().mockReturnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockRequest, mockNext).subscribe({
        error: (err) => {
          // Verify toast with default message
          expect(toastService.error).toHaveBeenCalledWith(
            'Ressource introuvable',
            'La ressource demandée n\'existe pas.',
            7000
          );

          done();
        }
      });
    });
  });
});
