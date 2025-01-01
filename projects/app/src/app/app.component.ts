import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OtpFormComponent } from '../../../otp-form/src/public-api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OtpFormComponent],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'app';
}
