<script lang="ts">
	import {openModal} from '@agnos-ui/svelte';
	import StackModal from './StackModal.svelte';
</script>

<button class="btn btn-primary" on:click={() => openModal({slotTitle: 'First modal', modalClass: 'modal-sm', slotDefault: StackModal})}
	>Launch demo modal</button
>
