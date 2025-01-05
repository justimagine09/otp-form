import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, interval, map, Subscription, takeWhile } from 'rxjs';

const DEFAULT_INPUT_COUNT: number = 4;

@Component({
  selector: 'lib-otp-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './otp-form.component.html',
  styles: ``
})
export class OtpFormComponent implements OnChanges, OnDestroy {
  @ViewChildren('input') inputElement!: QueryList<ElementRef<HTMLInputElement>>;

  @Output() onChanged = new EventEmitter();
  @Output() resendCode = new EventEmitter();

  @Input() title = 'OTP Verification';
  @Input() description = null;
  @Input() sentTo = 'youremail@gmail.com';
  @Input() emitWhenValidityChanged = true;
  @Input() disabled = false;
  @Input() expirationTime = 120; // seconds
  @Input() width = 40;
  @Input() height = 40;
  @Input() resendTimer = 10;
  @Input() maxResendReached = false;

  @Input() set inputCount(count: number) {
    this.initializeForm(count);
  }

  _inputCount: FormArray<any> = new FormArray<any>([]);
  _currentTimer = 0;
  _timerSubscription?: Subscription;
  _expirationTimeSubscription?: Subscription;
  listenerSubscription?: Subscription;
  
  private isValid = false;

  constructor() {
    this.initializeForm(DEFAULT_INPUT_COUNT);
    this.watchExpirationTime();
  }

  initializeForm(count: number) {
    this._inputCount = new FormArray<any>([]);
    
    for(let i = 0; i < count; i++) {
      this._inputCount.push(new FormControl('', [Validators.required]));
    }

    this.listenToChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['expirationTime']) {
      this.watchExpirationTime();
    }
  }

  ngOnDestroy(): void {
    this.listenerSubscription?.unsubscribe();
    this._timerSubscription?.unsubscribe();
    this._expirationTimeSubscription?.unsubscribe();
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
    if (this._currentTimer > 0) return;

    this._currentTimer = this.resendTimer;
    this._timerSubscription?.unsubscribe();
    this.resendCode.emit();
    this._timerSubscription = interval(1000)
    .pipe(takeWhile(() => this._currentTimer > 0))
      .subscribe(() => {
        this._currentTimer--;
      });
  }

  watchExpirationTime() {
    this._expirationTimeSubscription?.unsubscribe();

    this._expirationTimeSubscription = interval(1000)
    .pipe(takeWhile(() => this.expirationTime > 0))
      .subscribe(() => {
        this.expirationTime--;
      });
  }

  formattedExpirationTime() {

    if (this.expirationTime > 60) {
      let minutes: any = Math.trunc(this.expirationTime / 60);
      let seconds: any = this.expirationTime % 60;
      
      if(minutes < 10) {
        minutes = `0${minutes}`;
      }

      if(seconds < 10) {
        seconds = `0${seconds}`;
      }

      return `${minutes}:${seconds}s`;
    }

    return `${this.expirationTime}s`;
  }
}
