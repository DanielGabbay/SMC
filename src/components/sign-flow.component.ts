import { Component, ChangeDetectionStrategy, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { Booking } from '../models/booking.model';
import { SignaturePadComponent } from './signature-pad.component';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

declare var jspdf: any;

@Component({
  selector: 'app-sign-flow',
  templateUrl: './sign-flow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, SignaturePadComponent, ReactiveFormsModule],
})
export class SignFlowComponent {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  @ViewChild(SignaturePadComponent) signaturePad?: SignaturePadComponent;

  booking = signal<Booking | undefined>(undefined);
  verificationError = signal<string | null>(null);
  
  // 'verifying', 'signing', 'confirmed', 'not_found', 'already_confirmed'
  flowState = signal<'verifying' | 'signing' | 'confirmed' | 'not_found' | 'already_confirmed'>('verifying');

  idInput = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{9}$')]);
  agreementCheck = new FormControl(false, Validators.requiredTrue);
  creditCardNumber = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{16}$')]);
  creditCardExpiry = new FormControl('', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/?([0-9]{2})$')]);
  creditCardCvv = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]);

  isSignatureEmpty = signal(true);
  isSubmitting = signal(false);

  isFormValid = computed(() => {
    return this.agreementCheck.valid && this.creditCardNumber.valid && this.creditCardExpiry.valid && this.creditCardCvv.valid && !this.isSignatureEmpty();
  });

  constructor() {
    this.loadBooking();
  }

  async loadBooking() {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      const foundBooking = await this.bookingService.getBookingById(bookingId);
      this.booking.set(foundBooking);
      if (!foundBooking) {
        this.flowState.set('not_found');
      } else if (foundBooking.status === 'confirmed') {
        this.flowState.set('already_confirmed');
      }
    } else {
      this.flowState.set('not_found');
    }
  }

  verifyId() {
    if (this.idInput.invalid) {
      this.verificationError.set('יש להזין מספר זהות תקין בן 9 ספרות.');
      return;
    }
    if (this.idInput.value === this.booking()?.customer.id) {
      this.flowState.set('signing');
      this.verificationError.set(null);
    } else {
      this.verificationError.set('מספר הזהות אינו תואם להזמנה. אנא נסה שוב.');
    }
  }

  onSignature() {
    this.isSignatureEmpty.set(this.signaturePad?.isEmpty() ?? true);
  }

  async confirmAndSign() {
    if (!this.isFormValid()) return;
    
    this.isSubmitting.set(true);
    const signatureImage = this.signaturePad!.toDataURL();

    try {
      await this.bookingService.confirmBooking(this.booking()!.id, signatureImage);
      this.generatePdf(signatureImage);
      this.flowState.set('confirmed');
    } catch (error) {
       console.error('Failed to confirm booking', error);
      // Optional: show an error to the user
    } finally {
       this.isSubmitting.set(false);
    }
  }

  generatePdf(signatureImage: string) {
    const doc = new jspdf.jsPDF();
    const currentBooking = this.booking()!;

    doc.setFontSize(22);
    doc.text('Booking Agreement Confirmation', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Booking ID: ${currentBooking.id}`, 20, 40);
    doc.text(`Customer: ${currentBooking.customer.fullName}`, 20, 47);
    doc.text(`Dates: ${currentBooking.checkIn} to ${currentBooking.checkOut}`, 20, 54);
    
    doc.setFontSize(16);
    doc.text('Agreement Terms', 20, 70);
    
    doc.setFontSize(10);
    const agreementText = `
    This document confirms the booking details and agreement terms.
    1. Cancellation Policy: Cancellations made within 14 days of arrival are non-refundable.
    2. Check-in/Check-out: Check-in is from 15:00. Check-out is by 11:00.
    3. Rules: No smoking indoors. No parties or events allowed.
    By signing, you agree to all terms and conditions.
    `;
    doc.text(agreementText, 20, 80, { maxWidth: 170 });

    doc.setFontSize(14);
    doc.text('Customer Signature:', 20, 140);
    doc.addImage(signatureImage, 'PNG', 20, 145, 80, 40);

    doc.save(`booking-${currentBooking.id}.pdf`);
  }
}