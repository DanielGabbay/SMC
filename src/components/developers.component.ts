import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ErrorLoggingService } from '../services/error-logging.service';
import { supabase } from '../supabase.client';

@Component({
  selector: 'app-developers',
  templateUrl: './developers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule],
})
export class DevelopersComponent {
  errorLoggingService = inject(ErrorLoggingService);

  connectionStatus = signal<{ state: 'idle' | 'testing' | 'success' | 'error', message: string }>({ state: 'idle', message: '' });

  newMaxErrors = this.errorLoggingService.maxErrors();

  updateMaxErrors() {
    this.errorLoggingService.setMaxErrors(this.newMaxErrors);
  }

  generateTestError() {
    setTimeout(() => {
        throw new Error('This is a test error generated from DevelopersComponent.');
    }, 0);
  }

  async testSupabaseConnection() {
    this.connectionStatus.set({ state: 'testing', message: 'Testing connection...' });
    try {
      const { error } = await supabase.from('bookings').select('id', { count: 'exact', head: true });
      if (error) {
        throw error;
      }
      this.connectionStatus.set({ state: 'success', message: 'Supabase connection successful!' });
    } catch (error: any) {
      this.connectionStatus.set({ state: 'error', message: `Connection failed: ${error.message}` });
    } finally {
        setTimeout(() => this.connectionStatus.set({ state: 'idle', message: '' }), 5000);
    }
  }

  get supabaseUrl(): string {
      return supabase.supabaseUrl;
  }
}
