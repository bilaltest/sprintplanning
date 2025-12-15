import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Microservice, CreateMicroserviceRequest, UpdateMicroserviceRequest } from '../models/microservice.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MicroserviceService {
  private apiUrl = `${environment.apiUrl}/microservices`;

  constructor(private http: HttpClient) {}

  /**
   * Get all active microservices
   * @param releaseId Optional release ID to compute previousTag for each microservice
   */
  getAllActive(releaseId?: string): Observable<Microservice[]> {
    if (releaseId) {
      return this.http.get<Microservice[]>(`${this.apiUrl}?releaseId=${releaseId}`);
    }
    return this.http.get<Microservice[]>(this.apiUrl);
  }

  /**
   * Get all microservices (including inactive)
   */
  getAll(): Observable<Microservice[]> {
    return this.http.get<Microservice[]>(`${this.apiUrl}/all`);
  }

  /**
   * Get active microservices by squad
   */
  getBySquad(squad: string): Observable<Microservice[]> {
    return this.http.get<Microservice[]>(`${this.apiUrl}/squad/${squad}`);
  }

  /**
   * Get microservice by ID
   */
  getById(id: string): Observable<Microservice> {
    return this.http.get<Microservice>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new microservice
   */
  create(request: CreateMicroserviceRequest): Observable<Microservice> {
    return this.http.post<Microservice>(this.apiUrl, request);
  }

  /**
   * Update microservice
   */
  update(id: string, request: UpdateMicroserviceRequest): Observable<Microservice> {
    return this.http.put<Microservice>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Delete (soft delete) microservice
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Hard delete microservice (use with caution!)
   */
  hardDelete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/hard`);
  }
}
