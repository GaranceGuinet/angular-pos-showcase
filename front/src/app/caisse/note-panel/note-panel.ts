import { Component, inject, input, output } from '@angular/core';
import { NoteService } from '../../services/note.service';
import { EurosPipe } from '../../shared/euros.pipe';

@Component({
  imports: [EurosPipe],
  selector: 'app-note-panel',
  styleUrl: './note-panel.css',
  templateUrl: './note-panel.html',
})
export class NotePanel {
  readonly note = inject(NoteService);
  readonly payRequested = output<void>();
  readonly paymentInProgress = input(false);
}
