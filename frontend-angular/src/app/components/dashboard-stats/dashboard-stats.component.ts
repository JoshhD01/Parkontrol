import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface DashboardStatCard {
  icon: string;
  iconClass: string;
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss'],
})
export class DashboardStatsComponent {
  @Input() mainCards: DashboardStatCard[] = [];
  @Input() secondaryCards: DashboardStatCard[] = [];
}
