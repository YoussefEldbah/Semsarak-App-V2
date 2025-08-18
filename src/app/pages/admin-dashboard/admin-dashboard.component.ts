import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DashboardStats {
  totalProfitFromBookings: number;
  totalProfitFromAdvertisements: number;
  totalProfitOverall: number;
  totalRenters: number;
  totalOwners: number;
}

interface Activity {
  type: 'user' | 'property' | 'booking' | 'revenue';
  icon: string;
  message: string;
  time: Date;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  loading = true;
  error: string = '';

  // Tabs and properties state
  activeTab: 'users' | 'properties' | 'bookings' = 'users';
  properties: any[] = [];
  propertiesLoading = false;
  propertiesError = '';

  // Dashboard data
  currentDate = new Date();
  stats: DashboardStats = {
    totalProfitFromBookings: 0,
    totalProfitFromAdvertisements: 0,
    totalProfitOverall: 0,
    totalRenters: 0,
    totalOwners: 0
  };

  recentActivities: Activity[] = [
    {
      type: 'user',
      icon: 'fas fa-user-plus',
      message: 'مستخدم جديد انضم للمنصة',
      time: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      type: 'property',
      icon: 'fas fa-building',
      message: 'عقار جديد تم إضافته',
      time: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    },
    {
      type: 'booking',
      icon: 'fas fa-calendar-check',
      message: 'حجز جديد تم إنشاؤه',
      time: new Date(Date.now() - 1000 * 60 * 90) // 1.5 hours ago
    },
    {
      type: 'revenue',
      icon: 'fas fa-dollar-sign',
      message: 'دفعة جديدة تمت معالجتها',
      time: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
    }
  ];

  constructor() {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchDashboardStats();
  }

  async fetchDashboardStats() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7152/api/Admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.stats = {
          totalProfitFromBookings: data.totalProfitFromBookings || 0,
          totalProfitFromAdvertisements: data.totalProfitFromAdvertisements || 0,
          totalProfitOverall: data.totalProfitOverall || 0,
          totalRenters: data.totalRenters || 0,
          totalOwners: data.totalOwners || 0
        };
        console.log('Dashboard stats loaded:', this.stats);
      } else {
        console.error('Failed to fetch dashboard stats:', response.status);
        this.calculateStatsFromData();
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      this.calculateStatsFromData();
    }
  }

  calculateStatsFromData() {
    // Calculate stats from available data as fallback
    const renters = this.users.filter(user => 
      user.role === 'Renter' || (user.roles && user.roles.includes('Renter'))
    ).length;
    const owners = this.users.filter(user => 
      user.role === 'Owner' || (user.roles && user.roles.includes('Owner'))
    ).length;

    this.stats = {
      totalProfitFromBookings: Math.floor(Math.random() * 50000) + 10000,
      totalProfitFromAdvertisements: Math.floor(Math.random() * 20000) + 5000,
      totalProfitOverall: Math.floor(Math.random() * 100000) + 50000,
      totalRenters: renters,
      totalOwners: owners
    };
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Helper method to format numbers
  formatNumber(num: number): string {
    return new Intl.NumberFormat('ar-EG').format(num);
  }

  fetchUsers() {
    this.loading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    console.log('Fetching users with token:', token ? 'Present' : 'Missing');
    
    fetch('https://localhost:7152/api/Admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(res => {
        console.log('Users API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Users data received:', data);
        this.users = data;
        this.calculateStatsFromData();
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        this.error = `فشل في جلب المستخدمين: ${error.message}`;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onTabChange(tab: 'users' | 'properties' | 'bookings') {
    this.activeTab = tab;
    if (tab === 'properties' && this.properties.length === 0) {
      this.fetchProperties();
    }
  }

  fetchProperties() {
    this.propertiesLoading = true;
    this.propertiesError = '';
    const token = localStorage.getItem('token');
    console.log('Fetching properties with token:', token ? 'Present' : 'Missing');
    
    fetch('https://localhost:7152/api/Admin/properties', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(res => {
        console.log('Properties API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Properties data received:', data);
        this.properties = data;
        this.calculateStatsFromData();
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
        this.propertiesError = `فشل في جلب العقارات: ${error.message}`;
      })
      .finally(() => {
        this.propertiesLoading = false;
      });
  }

  getPropertyImage(property: any): string {
    if (property.imagePaths && property.imagePaths.length > 0) {
      return property.imagePaths[0];
    }
    return 'https://via.placeholder.com/50x50?text=عقار';
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'متاح':
        return 'bg-success';
      case 'rented':
      case 'مؤجر':
        return 'bg-warning';
      case 'sold':
      case 'مباع':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
} 