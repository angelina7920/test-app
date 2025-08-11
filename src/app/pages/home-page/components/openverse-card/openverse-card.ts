import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Openverse } from '../../models/openverse';

@Component({
  selector: 'app-openverse-card',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './openverse-card.html',
  styleUrl: './openverse-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class OpenverseCard {
  item = input.required<Openverse>();
  cardClick = output<Openverse>();

  onCardClick(): void {
    this.cardClick.emit(this.item());
  }
}
