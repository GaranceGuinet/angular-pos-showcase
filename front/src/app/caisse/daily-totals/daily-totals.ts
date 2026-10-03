import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { DailyTotal } from '../../models';
import { EurosPipe } from '../../shared/euros.pipe';

@Component({
  imports: [DatePipe, EurosPipe],
  selector: 'app-daily-totals',
  styleUrl: './daily-totals.css',
  templateUrl: './daily-totals.html',
})
export class DailyTotals {
  readonly totals = input.required<DailyTotal[]>();

  isToday(day: string): boolean {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return day === today;
  }
}
