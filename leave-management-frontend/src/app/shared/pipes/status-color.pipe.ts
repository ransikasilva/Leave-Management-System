import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor',
  standalone: true
})
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#ff9800'; // Orange
      case 'APPROVED':
        return '#4caf50'; // Green
      case 'REJECTED':
        return '#f44336'; // Red
      case 'CANCELLED':
        return '#9e9e9e'; // Grey
      default:
        return '#2196f3'; // Blue
    }
  }
}
