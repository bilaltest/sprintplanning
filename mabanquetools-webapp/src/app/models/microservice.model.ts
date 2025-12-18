export interface Microservice {
  id?: string;
  name: string;
  squad: string; // 'Squad 1' to 'Squad 6'
  solution?: string;
  displayOrder?: number;
  isActive: boolean;
  description?: string;
  previousTag?: string; // Tag N-1 (optionnel, calculé depuis release précédente)
}

export interface CreateMicroserviceRequest {
  name: string;
  squad: string;
  solution?: string;
  displayOrder?: number;
  description?: string;
}

export interface UpdateMicroserviceRequest {
  name?: string;
  squad?: string;
  solution?: string;
  displayOrder?: number;
  isActive?: boolean;
  description?: string;
}
