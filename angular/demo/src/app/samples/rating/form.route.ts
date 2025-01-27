import {AgnosUIAngularModule} from '@agnos-ui/angular';
import {NgIf} from '@angular/common';
import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
	standalone: true,
	imports: [AgnosUIAngularModule, ReactiveFormsModule, NgIf],
	template: `
		<label class="form-label" id="ratingLabel">Rating of your experience</label><br />
		<au-rating [formControl]="ctrl" ariaLabelledBy="ratingLabel" />
		<div id="form-msg" class="form-text small">
			<div *ngIf="ctrl.valid" class="text-success">Thanks!</div>
			<div *ngIf="ctrl.invalid" class="text-danger">Please rate us</div>
		</div>
		<pre>Model: <span id="form-model"><b>{{ ctrl.value }}</b></span></pre>
		<button id="form-btn-enable" class="btn btn-sm btn-outline-{{ ctrl.disabled ? 'danger' : 'success' }} me-2" (click)="toggle()">
			{{ ctrl.disabled ? 'control disabled' : ' control enabled' }}
		</button>
		<button id="form-btn-clear" class="btn btn-sm btn-outline-primary me-2" (click)="ctrl.setValue(0)">Clear</button>
	`,
})
export default class FormRatingComponent {
	ctrl = new FormControl(0, Validators.min(1));

	toggle() {
		if (this.ctrl.disabled) {
			this.ctrl.enable();
		} else {
			this.ctrl.disable();
		}
	}
}
