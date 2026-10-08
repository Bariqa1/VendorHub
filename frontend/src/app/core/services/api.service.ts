import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Contract,
  ContractAnalysis,
  ContractCreateRequest,
  ContractQuestionResponse,
  ContractStatus,
  DashboardMetrics,
  PageResponse,
  Vendor,
  VendorCreateRequest,
  VendorStatus
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.baseUrl}/dashboard/metrics`);
  }

  // Vendors
  getVendors(page: number = 0, size: number = 10, status?: VendorStatus, search?: string): Observable<PageResponse<Vendor>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.http.get<PageResponse<Vendor>>(`${this.baseUrl}/vendors`, { params });
  }

  getVendorByPublicId(publicId: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.baseUrl}/vendors/${publicId}`);
  }

  createVendor(vendor: VendorCreateRequest): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.baseUrl}/vendors`, vendor);
  }

  updateVendorStatus(publicId: string, status: VendorStatus, remarks?: string): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.baseUrl}/vendors/${publicId}/status`, { status, remarks });
  }

  // Contracts
  getContracts(page: number = 0, size: number = 10, status?: ContractStatus, vendorPublicId?: string, search?: string): Observable<PageResponse<Contract>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);
    if (vendorPublicId) params = params.set('vendorPublicId', vendorPublicId);
    if (search) params = params.set('search', search);

    return this.http.get<PageResponse<Contract>>(`${this.baseUrl}/contracts`, { params });
  }

  getContractByPublicId(publicId: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.baseUrl}/contracts/${publicId}`);
  }

  createContract(contract: ContractCreateRequest): Observable<Contract> {
    return this.http.post<Contract>(`${this.baseUrl}/contracts`, contract);
  }

  updateContractStatus(publicId: string, status: ContractStatus, remarks?: string): Observable<Contract> {
    return this.http.patch<Contract>(`${this.baseUrl}/contracts/${publicId}/status`, { status, remarks });
  }

  // AI Assistant
  analyzeContract(contractPublicId: string): Observable<ContractAnalysis> {
    return this.http.post<ContractAnalysis>(`${this.baseUrl}/ai/contracts/${contractPublicId}/analyze`, {});
  }

  askContractQuestion(contractPublicId: string, question: string): Observable<ContractQuestionResponse> {
    return this.http.post<ContractQuestionResponse>(`${this.baseUrl}/ai/contracts/${contractPublicId}/ask`, { question });
  }
}
