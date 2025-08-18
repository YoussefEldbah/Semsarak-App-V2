import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Property {
  id: number;
  title: string;
  description?: string;
  price: number;
  roomsCount?: number;
  genderPreference?: string;
  city?: string;
  region?: string;
  street?: string;
  imagePaths?: string[];
  [key: string]: any;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  properties: Property[] = [];
  allProperties: Property[] = [];
  user: any = null;
  location: string = '';
  propertyType: string = '';
  priceRange: string = '';
  roomsCount: number | null = null;
  region: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  paginatedProperties: Property[] = [];

  // Math object for template
  Math = Math;

  async ngOnInit() {
    this.user = this.getUserFromLocalStorage();
    await this.fetchProperties();
  }

  ngAfterViewInit() {
    this.initSmoothScrolling();
  }

  getUserFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  async fetchProperties() {
    try {
      let url = 'https://localhost:7152/api/Property';
      let headers: any = {};
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // Only call /my-properties if user is Owner
      if (this.user && (this.user.role === 'Owner' || (this.user.roles && this.user.roles.includes('Owner')))) {
        url = 'https://localhost:7152/api/Property/my-properties';
        if (token) headers['Authorization'] = 'Bearer ' + token;
      } else if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }
      const res = await fetch(url, { headers });
      if (!res.ok) {
        this.properties = [];
        this.allProperties = [];
        console.error('Error fetching properties:', res.status, await res.text());
        return;
      }
      this.allProperties = await res.json();
      this.properties = [...this.allProperties];
      console.log('properties from API:', this.properties);
      this.updatePagination();
    } catch (err) {
      this.properties = [];
      this.allProperties = [];
      console.error('Error fetching properties:', err);
    }
  }

  getImageUrl(path?: string): string {
    if (!path) return 'https://via.placeholder.com/400x250';
    if (path.startsWith('http')) return path;
    return `https://localhost:7152${path}`;
  }



  // Smooth Scrolling
  initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = (e.target as HTMLAnchorElement).getAttribute('href');
        if (targetId) {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  searchProperties() {
    let filtered = [...this.allProperties];

    if (this.location) {
      filtered = filtered.filter(property =>
        property.city?.toLowerCase().includes(this.location.toLowerCase())
      );
    }

    if (this.region) {
      filtered = filtered.filter(property =>
        property.region?.toLowerCase().includes(this.region.toLowerCase())
      );
    }

    if (this.priceRange) {
      const [min, max] = this.priceRange.replace(/[$,]/g, '').split(' - ');
      const minPrice = parseInt(min);
      const maxPrice = max === '+' ? Infinity : parseInt(max);
      
      filtered = filtered.filter(property => {
        const price = property.price;
        return price >= minPrice && (maxPrice === Infinity || price <= maxPrice);
      });
    }

    this.properties = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.properties.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProperties = this.properties.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  viewPropertyDetails(propertyId: number) {
    // This will be handled by the router link in the template
    console.log('Viewing property:', propertyId);
  }

  sendContactMessage() {
    // Implement contact form submission
    console.log('Sending contact message...');
  }
}
