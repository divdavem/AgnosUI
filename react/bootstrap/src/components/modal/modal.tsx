import {Portal} from '@agnos-ui/react-headless/utils/portal';
import type {AdaptSlotContentProps, AdaptWidgetSlots, PropsConfig, WidgetProps, WidgetState} from '@agnos-ui/react-headless/types';
import {toSlotContextWidget} from '@agnos-ui/react-headless/types';
import {Slot} from '@agnos-ui/react-headless/slot';
import {useWidgetWithConfig} from '../../config';
import {useDirective, useClassDirective, useDirectives} from '@agnos-ui/react-headless/utils/directive';
import type {PropsWithChildren, Ref, RefAttributes} from 'react';
import ReactDOM from 'react-dom/client';
import {forwardRef, useImperativeHandle} from 'react';
import {createModal as coreCreateModal} from '@agnos-ui/core-bootstrap/components/modal';
import type {ModalApi} from '@agnos-ui/core-bootstrap/components/modal';

export * from '@agnos-ui/core-bootstrap/components/modal';

export type ModalWidget<Data> = AdaptWidgetSlots<import('@agnos-ui/core-bootstrap/components/modal').ModalWidget<Data>>;
export type ModalProps<Data> = WidgetProps<ModalWidget<Data>>;
export type ModalState<Data> = WidgetState<ModalWidget<Data>>;
export type ModalContext<Data> = AdaptSlotContentProps<import('@agnos-ui/core-bootstrap/components/modal').ModalContext<Data>>;
export const createModal: <Data>(propsConfig?: PropsConfig<ModalProps<Data>>) => ModalWidget<Data> = coreCreateModal as any;

const DefaultSlotHeader = <Data,>(slotContext: ModalContext<Data>) => {
	const refCloseButton = useDirective(slotContext.widget.directives.closeButtonDirective);
	return (
		<>
			<h5 className="modal-title">
				<Slot slotContent={slotContext.state.slotTitle} props={slotContext} />
			</h5>
			{slotContext.state.closeButton && <button className="btn-close" {...refCloseButton} />}
		</>
	);
};

const DefaultSlotStructure = <Data,>(slotContext: ModalContext<Data>) => (
	<>
		{slotContext.state.slotTitle && (
			<div className="modal-header">
				<Slot slotContent={slotContext.state.slotHeader} props={slotContext} />
			</div>
		)}
		<div className="modal-body">
			<Slot slotContent={slotContext.state.slotDefault} props={slotContext} />
		</div>
		{slotContext.state.slotFooter && (
			<div className="modal-footer">
				<Slot slotContent={slotContext.state.slotFooter} props={slotContext} />
			</div>
		)}
	</>
);

const defaultConfig: Partial<ModalProps<any>> = {
	slotHeader: DefaultSlotHeader,
	slotStructure: DefaultSlotStructure,
};

const BackdropElement = <Data,>({widget}: ModalContext<Data>) => (
	<div {...useDirectives([useClassDirective('modal-backdrop'), widget.directives.backdropDirective])} />
);

const ModalElement = <Data,>(slotContext: ModalContext<Data>) => (
	<div {...useDirectives([useClassDirective('modal d-block'), slotContext.widget.directives.modalDirective])}>
		<div className="modal-dialog">
			<div className="modal-content">
				<Slot slotContent={slotContext.state.slotStructure} props={slotContext} />
			</div>
		</div>
	</div>
);

export const Modal = forwardRef(function Modal<Data>(props: PropsWithChildren<Partial<ModalProps<Data>>>, ref: Ref<ModalApi<Data>>) {
	const [state, widget] = useWidgetWithConfig(createModal<Data>, props, 'modal', {...defaultConfig, slotDefault: props.children});
	useImperativeHandle(ref, () => widget.api, []);
	const slotContext: ModalContext<Data> = {
		state,
		widget: toSlotContextWidget(widget),
	};
	return (
		<Portal container={state.container}>
			{!state.backdropHidden && <BackdropElement {...slotContext} />}
			{!state.hidden && <ModalElement {...slotContext} />}
		</Portal>
	);
}) as <Data>(props: PropsWithChildren<Partial<ModalProps<Data>>> & RefAttributes<ModalApi<Data>>) => JSX.Element;

export async function openModal<Data>(options: Partial<ModalProps<Data>>) {
	const root = ReactDOM.createRoot(document.createElement('div'));
	try {
		const api = await new Promise<ModalApi<Data> | null>((resolve) => {
			root.render(<Modal {...options} ref={resolve} />);
		});
		return await api!.open();
	} finally {
		root.unmount();
	}
}
