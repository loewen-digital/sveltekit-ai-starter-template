export type Toast = {
	id: string;
	message: string;
	variant: 'info' | 'success' | 'warning' | 'danger';
	duration?: number;
};

const DEFAULT_DURATION = 5000;

let toasts = $state<Toast[]>([]);

export function addToast(toast: Omit<Toast, 'id'>): void {
	const id = crypto.randomUUID();
	toasts.push({ ...toast, id });

	setTimeout(() => {
		dismissToast(id);
	}, toast.duration ?? DEFAULT_DURATION);
}

export function dismissToast(id: string): void {
	toasts = toasts.filter((t) => t.id !== id);
}

export function getToasts(): Toast[] {
	return toasts;
}
