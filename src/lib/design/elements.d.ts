/**
 * Attribute typing for the element-library tags used in Svelte templates, so
 * svelte-check catches a wrong variant or size. Booleans may be passed as
 * booleans; element-js parses the resulting "true"/"false" attributes.
 */
import type { HTMLAttributes } from 'svelte/elements';

type Toggle = boolean | 'true' | 'false';

type FieldAttributes = HTMLAttributes<HTMLElement> & {
	name: string;
	label?: string;
	value?: string | null;
	placeholder?: string;
	required?: Toggle;
	disabled?: Toggle;
	'label-screen-reader-only'?: Toggle;
	'help-message'?: string;
	'error-message'?: string;
	valid?: Toggle;
	touched?: Toggle;
	pattern?: string;
};

declare module 'svelte/elements' {
	export interface SvelteHTMLElements {
		'el-input-field': FieldAttributes & {
			type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
		};
		'el-password-field': FieldAttributes & {
			'password-toggle'?: Toggle;
			'password-visible'?: Toggle;
		};
		'el-notification': HTMLAttributes<HTMLElement> & {
			open?: Toggle;
			variant?: 'default' | 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
			closable?: Toggle;
			duration?: number;
			'onnotification-show'?: (event: CustomEvent) => void;
			'onnotification-after-show'?: (event: CustomEvent) => void;
			'onnotification-hide'?: (event: CustomEvent) => void;
			'onnotification-after-hide'?: (event: CustomEvent) => void;
		};
		'el-dialog': HTMLAttributes<HTMLElement> & {
			open?: Toggle;
			label?: string;
			'no-header'?: Toggle;
			'close-label'?: string;
			'ondialog-show'?: (event: CustomEvent) => void;
			'ondialog-after-show'?: (event: CustomEvent) => void;
			'ondialog-hide'?: (event: CustomEvent) => void;
			'ondialog-after-hide'?: (event: CustomEvent) => void;
			'ondialog-initial-focus'?: (event: CustomEvent) => void;
			'ondialog-request-close'?: (
				event: CustomEvent<{ source: 'close-button' | 'keyboard' | 'overlay' }>
			) => void;
		};
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
