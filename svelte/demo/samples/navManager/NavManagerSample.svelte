<script lang="ts">
	import type {NavManagerItemConfig} from '@agnos-ui/core';
	import {createNavManager} from '@agnos-ui/core';

	const {directive, focusLeft, focusRight, focusFirst, focusLast} = createNavManager();

	const navManagerConfig: NavManagerItemConfig = {
		keys: {
			ArrowLeft: focusLeft,
			ArrowRight: focusRight,
			Home: focusFirst,
			End: focusLast,
		},
	};
</script>

<div class="d-flex">
	<input use:directive={navManagerConfig} tabindex="-1" type="text" value="1" class="form-control me-1" />
	<span use:directive={navManagerConfig} tabindex="-1" class="form-control w-auto me-1">2</span>
	<input use:directive={navManagerConfig} type="text" value="" class="form-control me-1" />
	<span use:directive={navManagerConfig} tabindex="-1" class="form-control w-auto me-1">3</span>
	<span use:directive={navManagerConfig} tabindex="-1" class="form-control w-auto me-1">4</span>
	<input use:directive={navManagerConfig} tabindex="-1" type="text" value="disabled" disabled class="form-control me-1" />
	<input use:directive={navManagerConfig} tabindex="-1" type="checkbox" disabled class="form-check-input align-self-center me-1" />
	<input use:directive={navManagerConfig} tabindex="-1" type="checkbox" class="form-check-input align-self-center me-1" />
	<span use:directive={navManagerConfig} tabindex="-1" class="form-control w-auto me-1">5</span>
	<input use:directive={navManagerConfig} tabindex="-1" type="text" value="6" class="form-control me-1" />
</div>
