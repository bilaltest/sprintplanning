import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClosedDay } from '../models/closed-day.model';

@Injectable({
    providedIn: 'root'
})
export class ClosedDayService {
    private readonly API_URL = `${environment.apiUrl}/closed-days`;

    constructor(private http: HttpClient) { }

    getAllClosedDays(): Observable<ClosedDay[]> {
        return this.http.get<ClosedDay[]>(this.API_URL);
    }

    createClosedDay(closedDay: ClosedDay): Observable<ClosedDay> {
        return this.http.post<ClosedDay>(this.API_URL, closedDay);
    }

    deleteClosedDay(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }
}
