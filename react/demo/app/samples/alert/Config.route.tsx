import type {AlertWidget} from '@agnos-ui/core';
import {Alert} from '@agnos-ui/react';
import {useRef, useState} from 'react';

export enum AlertStatus {
	success = 'success',
	info = 'info',
	warning = 'warning',
	danger = 'danger',
	primary = 'primary',
	secondary = 'secondary',
	light = 'light',
	dark = 'dark',
}

const DefaultDemo = () => {
	const alertRef = useRef<AlertWidget['api']>();

	const [animationOnInit, setAnimationOnInit] = useState(true);
	const [animation, setanimation] = useState(true);
	const [dismissible, setDismissible] = useState(true);
	const [type, setType] = useState(String(AlertStatus.success));

	return (
		<>
			<button type="button" className="btn btn-primary showAlert" onClick={() => alertRef.current?.open()}>
				Show alert
			</button>
			<br />
			<br />
			<div className="d-flex flex-column">
				<div className="d-flex form-group">
					<label className="align-self-center me-3" htmlFor="typeSelect">
						Alert type:{' '}
					</label>
					<select id="typeSelect" className="form-select w-auto" value={type} onChange={(e) => setType(e.target.value)}>
						{Object.entries(AlertStatus)
							.map((entry) => {
								return {
									value: entry[1],
									label: entry[0],
								};
							})
							.map((status) => (
								<option key={status.value} value={status.value}>
									{status.label}
								</option>
							))}
					</select>
				</div>
				<label>
					<input
						className="form-check-input me-1"
						type="checkbox"
						defaultChecked={animationOnInit}
						onChange={(e) => setAnimationOnInit(e.target.checked)}
					/>
					Animation on init
				</label>
				<label>
					<input className="form-check-input me-1" type="checkbox" defaultChecked={animation} onChange={(e) => setanimation(e.target.checked)} />
					Animation
				</label>
				<label>
					<input
						className="dismissibleInput form-check-input me-1"
						type="checkbox"
						defaultChecked={dismissible}
						onChange={(e) => setDismissible(e.target.checked)}
					/>
					Dismissible
				</label>
			</div>

			<br />
			<br />

			<Alert ref={alertRef} animationOnInit={animationOnInit} animation={animation} dismissible={dismissible} type={type}>
				<h4 className="alert-heading">Well done!</h4>
				<p>
					Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing
					within an alert works with this kind of content.
				</p>
				<hr />
				<p className="mb-0">Whenever you need to, be sure to use margin utilities to keep things nice and tidy.</p>
			</Alert>
		</>
	);
};

export default DefaultDemo;
