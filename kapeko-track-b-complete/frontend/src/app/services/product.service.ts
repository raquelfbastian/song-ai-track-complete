// product.service.ts — Track B (Angular)
// Calls the same Spring Boot REST API as Track C
// Angular uses HttpClient + Observable (RxJS) instead of fetch + Promise

import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { map }         from 'rxjs/operators';
import { Product, CatalogResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  // Proxied to Spring Boot :8080 via angular.json proxy config
  private BASE = '/api';

  constructor(private http: HttpClient) {}

  // ── Lab 3 ────────────────────────────────────────────────────────────────

  /** POST /api/catalog/generate — calls LLM, returns generated products */
  generateCatalog(): Observable<CatalogResponse> {
    return this.http.post<CatalogResponse>(`${this.BASE}/catalog/generate`, {});
  }

  /** GET /api/catalog — returns existing catalog */
  getCatalog(): Observable<CatalogResponse> {
    return this.http.get<CatalogResponse>(`${this.BASE}/catalog`);
  }

  // ── Lab 4 ────────────────────────────────────────────────────────────────

  /** POST /api/products/:id/enrich — AI-enriches one product */
  enrichProduct(id: string): Observable<Product> {
    return this.http.post<Product>(`${this.BASE}/products/${id}/enrich`, {});
  }

  /** POST /api/catalog/enrich-all — batch enriches all products */
  enrichAll(): Observable<CatalogResponse> {
    return this.http.post<CatalogResponse>(`${this.BASE}/catalog/enrich-all`, {});
  }

  // ── Lab 5 ────────────────────────────────────────────────────────────────

  /** GET /api/products — all products for listing page */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.BASE}/products`);
  }

  /** GET /api/products/:id — single product for detail page */
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.BASE}/products/${id}`);
  }
}
