/**
 * Attribute typing for the element-library tags used in Svelte templates, so
 * svelte-check catches a wrong variant or size. Booleans may be passed as
 * booleans; element-js parses the resulting "true"/"false" attributes.
 */
import type { HTMLAttributes } from 'svelte/elements';

type Toggle = boolean | 'true' | 'false';

declare module 'svelte/elements' {
	export interface SvelteHTMLElements {
		'el-button': HTMLAttributes<HTMLElement> & {
			variant?: 'default' | 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'text';
			size?: 'small' | 'medium' | 'large';
			type?: 'button' | 'submit' | 'reset';
			disabled?: Toggle;
			loading?: Toggle;
			outline?: Toggle;
			pill?: Toggle;
			circle?: Toggle;
			caret?: Toggle;
			name?: string;
			value?: string;
			href?: string;
			target?: string;
			rel?: string;
			download?: string;
		};
	}
}
