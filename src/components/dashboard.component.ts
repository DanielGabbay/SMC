import { Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { NewBookingComponent } from './new-booking.component';
import { Booking } from '../models/booking.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, NewBookingComponent],
})
export class DashboardComponent {
  
  bookings = computed(() => {
    // sort by most recent first
    return this.bookingService.bookings().slice().sort((a, b) => b.createdAt - a.createdAt);
  });
  
  notificationText = '';
  showNotification = false;

  bookingToDelete = signal<Booking | null>(null);

  constructor(private bookingService: BookingService) {}

  getBookingLink(bookingId: string): string {
    // Construct the base URL by taking the current URL and removing any hash fragment.
    const baseUrl = window.location.href.split('#')[0];
    // Ensure we have a clean base URL and then append the hash route for the signature flow.
    return `${baseUrl.replace(/\/$/, '')}/#/sign/${bookingId}`;
  }

  copyLink(bookingId: string) {
    const link = this.getBookingLink(bookingId);
    navigator.clipboard.writeText(link).then(() => {
      this.showToast('הקישור הועתק!');
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      this.showToast('שגיאה בהעתקת הקישור.');
    });
  }

  getWhatsAppLink(bookingId: string) {
    const link = this.getBookingLink(bookingId);
    const message = encodeURIComponent(`לאישור הזמנתך, אנא לחץ על הקישור: ${link}`);
    return `https://wa.me/?text=${message}`;
  }

  getSmsLink(bookingId: string) {
    const link = this.getBookingLink(bookingId);
    const message = encodeURIComponent(`לאישור הזמנתך, אנא לחץ על הקישור: ${link}`);
    return `sms:?&body=${message}`;
  }

  openDeleteModal(booking: Booking) {
    this.bookingToDelete.set(booking);
    (document.getElementById('deleteBookingDialog') as HTMLDialogElement).showModal();
  }

  closeDeleteModal() {
    this.bookingToDelete.set(null);
    (document.getElementById('deleteBookingDialog') as HTMLDialogElement).close();
  }

  async confirmDelete() {
    const booking = this.bookingToDelete();
    if (booking) {
      try {
        await this.bookingService.deleteBooking(booking.id);
        this.showToast('ההזמנה נמחקה בהצלחה.');
      } catch (err) {
        console.error('Failed to delete booking:', err);
        this.showToast('שגיאה במחיקת ההזמנה.');
      } finally {
        this.closeDeleteModal();
      }
    }
  }

  private showToast(message: string) {
    this.notificationText = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
}