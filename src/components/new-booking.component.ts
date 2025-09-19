import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-new-booking',
  templateUrl: './new-booking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  host: {
    class: 'flex flex-col flex-1 min-h-0'
  }
})
export class NewBookingComponent {
  private bookingService = inject(BookingService);
  private fb = inject(NonNullableFormBuilder);

  close = output<void>();

  // FIX: The previous inlined `inject(NonNullableFormBuilder)` call caused a type inference error.
  // By assigning the injected service to a property first, TypeScript can correctly resolve its type.
  bookingForm = this.fb.group({
    fullName: ['', Validators.required],
    idNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
    phone: ['', [Validators.required, Validators.pattern('^05[0-9]{8}$')]],
    email: ['', Validators.email],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    adults: [2, [Validators.required, Validators.min(1)]],
    children: [0, [Validators.required, Validators.min(0)]],
    totalAmount: [0, [Validators.required, Validators.min(1)]],
    depositPaid: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  isSubmitting = signal(false);

  async onSubmit() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);

    const formValue = this.bookingForm.getRawValue();

    try {
      await this.bookingService.addBooking({
        customer: {
          id: formValue.idNumber,
          fullName: formValue.fullName,
          phone: formValue.phone,
          email: formValue.email || undefined,
        },
        checkIn: formValue.checkIn,
        checkOut: formValue.checkOut,
        adults: formValue.adults,
        children: formValue.children,
        totalAmount: formValue.totalAmount,
        depositPaid: formValue.depositPaid,
        notes: formValue.notes || undefined,
      });
      this.close.emit();
    } catch (error) {
      console.error('Failed to create booking', error);
      // Optional: show an error message to the user
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel() {
    this.close.emit();
  }
}
