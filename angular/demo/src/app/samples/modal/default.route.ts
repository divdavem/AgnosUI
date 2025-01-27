import type {ModalComponent} from '@agnos-ui/angular';
import {AgnosUIAngularModule} from '@agnos-ui/angular';
import {modalCloseButtonClick, modalOutsideClick} from '@agnos-ui/core';
import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
	standalone: true,
	imports: [AgnosUIAngularModule, CommonModule, FormsModule],
	template: `
		<button class="btn btn-primary" (click)="show(modal)">Launch demo modal</button>
		<div class="mt-3" data-testid="message">{{ message }}</div>
		<au-modal #modal slotTitle="Save changes">
			Do you want to save your changes?
			<ng-template auModalFooter>
				<button type="button" class="btn btn-outline-primary" (click)="modal.api.close(true)">Yes</button>
				<button type="button" class="btn btn-outline-danger" (click)="modal.api.close(false)">No</button>
			</ng-template>
		</au-modal>
	`,
})
export default class DefaultModalComponent {
	message = '';

	async show(modal: ModalComponent) {
		this.message = '';
		const result = await modal.api.open();
		if (result === modalCloseButtonClick) {
			this.message = 'You clicked on the close button';
		} else if (result === modalOutsideClick) {
			this.message = 'You clicked outside the modal';
		} else {
			this.message = `You answered the question with "${result ? 'Yes' : 'No'}"`;
		}
	}
}
