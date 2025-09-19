import { Injectable, signal } from '@angular/core';
import { Booking } from '../models/booking.model';
import { supabase } from '../supabase.client';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = signal<Booking[]>([]);
  public bookings = this._bookings.asReadonly();

  constructor() {
    this.loadBookings();
  }

  async loadBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching bookings:', error);
      return;
    }

    const bookings = data.map(this.mapToBookingModel);
    this._bookings.set(bookings);
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
     const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // It's normal for .single() to error if no row is found
      if (error.code !== 'PGRST116') {
         console.error(`Supabase error fetching booking ${id}:`, error);
      }
      return undefined;
    }
    
    return data ? this.mapToBookingModel(data) : undefined;
  }

  async addBooking(bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
    const newBooking = {
      ...bookingData,
      id: `ORD-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      status: 'pending' as const,
    };
    
    const dbRecord = this.mapToDbRecord(newBooking);
    // Let the database set the creation timestamp by not providing 'created_at'

    const { data, error } = await supabase
        .from('bookings')
        .insert(dbRecord)
        .select()
        .single();

    if (error) {
        console.error('Supabase error adding booking:', error);
        throw error;
    }

    const addedBooking = this.mapToBookingModel(data);
    this._bookings.update(bookings => [addedBooking, ...bookings]);
    return addedBooking;
  }

  async confirmBooking(id: string, signature: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed', signature })
      .eq('id', id);

    if (error) {
      console.error('Supabase error confirming booking:', error);
      throw error;
    }

    this._bookings.update(bookings =>
      bookings.map(b =>
        b.id === id ? { ...b, status: 'confirmed', signature } : b
      )
    );
  }
  
  async deleteBooking(id: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting booking:', error);
      throw error;
    }

    this._bookings.update(bookings => bookings.filter(b => b.id !== id));
  }

  private mapToBookingModel(record: any): Booking {
    return {
      id: record.id,
      customer: record.customer,
      checkIn: record.check_in,
      checkOut: record.check_out,
      adults: record.adults,
      children: record.children,
      notes: record.notes,
      totalAmount: record.total_amount,
      depositPaid: record.deposit_paid,
      status: record.status,
      signature: record.signature,
      createdAt: new Date(record.created_at).getTime(),
    };
  }

  private mapToDbRecord(booking: Partial<Booking>): any {
    const record: any = {
      id: booking.id,
      customer: booking.customer,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      adults: booking.adults,
      children: booking.children,
      notes: booking.notes,
      total_amount: booking.totalAmount,
      deposit_paid: booking.depositPaid,
      status: booking.status,
      signature: booking.signature,
    };
    
    // Only include created_at if it exists on the booking object
    if (booking.createdAt) {
      record.created_at = new Date(booking.createdAt).toISOString();
    }

    return record;
  }
}