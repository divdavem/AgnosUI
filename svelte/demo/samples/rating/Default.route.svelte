<script lang="ts">
	import {Rating} from '@agnos-ui/svelte';

	let rating = 3;
	let hovered = 0;
	let left = 0;
</script>

<Rating bind:rating on:hover={(e) => (hovered = e.detail)} on:leave={(e) => (left = e.detail)} ariaLabel="rating" />
<div>
	Current rate: <span id="defaultRating">{rating}</span><br />
	Hovered: <span id="defaultHovered">{hovered}</span><br />
	Left: <span id="defaultLeft">{left}</span>
</div>
