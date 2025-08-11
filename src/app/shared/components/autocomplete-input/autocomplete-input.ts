import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-autocomplete-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './autocomplete-input.html',
  styleUrl: './autocomplete-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteInput),
      multi: true,
    },
  ],
})
export class AutocompleteInput implements ControlValueAccessor {
  options = input.required<string[]>();

  value = signal<string>('');
  hasFocus = signal<boolean>(false);

  onChangeFn: (value: string) => void = () => {};
  onTouchedFn: () => void = () => {};

  onChange(value: string): void {
    if (this.onChangeFn) {
      this.value.set(value);
      this.onChangeFn(value);
      this.onTouchedFn();
    }
  }

  writeValue(value: string): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  onFocus(): void {
    this.hasFocus.set(true);
  }

  onBlur(): void {
    this.hasFocus.set(false);
  }
}
