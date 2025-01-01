import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';

const DEFAULT_INPUT_COUNT: number = 4;

@Component({
  selector: 'lib-otp-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './otp-form.component.html',
  styles: ``
})
export class OtpFormComponent implements OnDestroy {
  @ViewChildren('input') inputElement!: QueryList<ElementRef<HTMLInputElement>>;
  @Input() sentTo = 'your@email.com';
  @Input() emitWhenValidityChanged = true;
  @Input() disabled = false;
  @Input() width = 40;
  @Input() height = 40;
  @Input() set inputCount(count: number) {
    this.initializeForm(count);
  }
  @Output() onChanged = new EventEmitter();
  _inputCount: FormArray<any> = new FormArray<any>([]);
  listenerSubscription?: Subscription;
  
  private isValid = false;

  constructor() {
    this.initializeForm(DEFAULT_INPUT_COUNT);
  }

  initializeForm(count: number) {
    this._inputCount = new FormArray<any>([]);
    
    for(let i = 0; i < count; i++) {
      this._inputCount.push(new FormControl('', [Validators.required]));
    }

    this.listenToChanges();
  }

  ngOnDestroy(): void {
    this.listenerSubscription?.unsubscribe();
  }

  listenToChanges() {
    this.listenerSubscription?.unsubscribe();
    this.listenerSubscription = this._inputCount.valueChanges.pipe(
      debounceTime(100),
      map((values: string[]) => values.join('')),
      distinctUntilChanged()
    ).subscribe((value: string) => {
      if (!this.emitWhenValidityChanged) {
        this.onChanged.emit({value, valid: this._inputCount.valid});
        return;
      }

      // Only Emit value when valid
      if (!this.isValid && this._inputCount.valid) {
        this.onChanged.emit({value, valid: this._inputCount.valid});
      } else if (this.isValid && this._inputCount.invalid) {
        this.onChanged.emit({value, valid: this._inputCount.valid});
      }

      this.isValid = this._inputCount.valid;
    });
  }

  onInput(index: number, input: any, $event: any) {
    input.setValue($event.data?.trim() ?? '');
    if (!input.value || index + 1 >= this._inputCount.length) return;
    this.inputElement.get(index + 1)!.nativeElement.focus();
  }

  onKeydown(index: number, input: any, $event: KeyboardEvent) {
    if ($event.key !== 'Backspace' || index <= 0) return;
    input.setValue('');
    setTimeout(() => {
      this.inputElement.get(index - 1)!.nativeElement.focus();
    }, 10);
  }

  resend() {
    
  }
}
