export * from '@agnos-ui/core';
export {Slot};

import Slot from './Slot.svelte';

export * from './utils.js';
export type {SlotContent, WidgetsConfig} from './utils.js';

import type {WidgetProps, WidgetState} from '@agnos-ui/core';
import type {AdaptSlotContentProps, AdaptWidgetSlots, WidgetPropsSlots} from './utils.js';

export type AccordionWidget = AdaptWidgetSlots<import('@agnos-ui/core').AccordionWidget>;
export type AccordionProps = WidgetProps<AccordionWidget>;
export type AccordionState = WidgetState<AccordionWidget>;
export type AccordionSlots = WidgetPropsSlots<AccordionProps>;
export type AccordionItemWidget = AdaptWidgetSlots<import('@agnos-ui/core').AccordionItemWidget>;
export type AccordionItemProps = WidgetProps<AccordionItemWidget>;
export type AccordionItemState = WidgetState<AccordionItemWidget>;
export type AccordionItemContext = AdaptSlotContentProps<import('@agnos-ui/core').AccordionItemContext>;

export type AlertWidget = AdaptWidgetSlots<import('@agnos-ui/core').AlertWidget>;
export type AlertProps = WidgetProps<AlertWidget>;
export type AlertState = WidgetState<AlertWidget>;
export type AlertSlots = WidgetPropsSlots<AlertProps>;

export type ModalWidget = AdaptWidgetSlots<import('@agnos-ui/core').ModalWidget>;
export type ModalProps = WidgetProps<ModalWidget>;
export type ModalState = WidgetState<ModalWidget>;
export type ModalContext = AdaptSlotContentProps<import('@agnos-ui/core').ModalContext>;
export type ModalSlots = WidgetPropsSlots<ModalProps>;

export type PaginationWidget = AdaptWidgetSlots<import('@agnos-ui/core').PaginationWidget>;
export type PaginationProps = WidgetProps<PaginationWidget>;
export type PaginationState = WidgetState<PaginationWidget>;
export type PaginationContext = AdaptSlotContentProps<import('@agnos-ui/core').PaginationContext>;
export type PaginationNumberContext = AdaptSlotContentProps<import('@agnos-ui/core').PaginationNumberContext>;
export type PaginationSlots = WidgetPropsSlots<PaginationProps>;

export type RatingWidget = AdaptWidgetSlots<import('@agnos-ui/core').RatingWidget>;
export type RatingProps = WidgetProps<RatingWidget>;
export type RatingState = WidgetState<RatingWidget>;
export type RatingSlots = WidgetPropsSlots<RatingProps>;

export type SelectWidget<Item> = AdaptWidgetSlots<import('@agnos-ui/core').SelectWidget<Item>>;
export type SelectProps<Item> = WidgetProps<SelectWidget<Item>>;
export type SelectState<Item> = WidgetState<SelectWidget<Item>>;
export type SelectSlots<Item> = WidgetPropsSlots<SelectProps<Item>>;

export type ProgressbarWidget = AdaptWidgetSlots<import('@agnos-ui/core').ProgressbarWidget>;
export type ProgressbarProps = WidgetProps<ProgressbarWidget>;
export type ProgressbarState = WidgetState<ProgressbarWidget>;
export type ProgressbarSlots = WidgetPropsSlots<ProgressbarProps>;
