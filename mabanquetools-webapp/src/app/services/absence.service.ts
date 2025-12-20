import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Absence, AbsenceUser, CreateAbsenceRequest } from '../models/absence.model';

@Injectable({
    providedIn: 'root'
})
export class AbsenceService {
    private readonly API_URL = `${environment.apiUrl}/absences`;

    constructor(private http: HttpClient) { }

    getAbsences(startDate?: string, endDate?: string): Observable<Absence[]> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        return this.http.get<Absence[]>(this.API_URL, { params });
    }

    getAbsenceUsers(): Observable<AbsenceUser[]> {
        return this.http.get<AbsenceUser[]>(`${this.API_URL}/users`);
    }

    createAbsence(request: CreateAbsenceRequest): Observable<Absence> {
        return this.http.post<Absence>(this.API_URL, request);
    }

    updateAbsence(id: string, request: CreateAbsenceRequest): Observable<Absence> {
        return this.http.put<Absence>(`${this.API_URL}/${id}`, request);
    }

    deleteAbsence(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }
}
