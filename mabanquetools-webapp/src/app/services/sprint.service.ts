import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sprint } from '@models/sprint.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SprintService {
    private readonly API_URL = `${environment.apiUrl}/sprints`;

    constructor(private http: HttpClient) { }

    getAllSprints(): Observable<Sprint[]> {
        return this.http.get<Sprint[]>(this.API_URL);
    }

    createSprint(sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>): Observable<Sprint> {
        return this.http.post<Sprint>(this.API_URL, sprint);
    }

    updateSprint(id: string, sprint: Partial<Sprint>): Observable<Sprint> {
        return this.http.put<Sprint>(`${this.API_URL}/${id}`, sprint);
    }

    deleteSprint(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }
}
