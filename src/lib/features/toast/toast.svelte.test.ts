import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { addToast, dismissToast, getToasts } from './toast.svelte.js';

describe('toast', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Clear all toasts
		for (const toast of getToasts()) {
			dismissToast(toast.id);
		}
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('addToast adds a toast with generated id', () => {
		addToast({ message: 'Hello', variant: 'info' });
		const toasts = getToasts();
		expect(toasts).toHaveLength(1);
		expect(toasts[0].message).toBe('Hello');
		expect(toasts[0].variant).toBe('info');
		expect(toasts[0].id).toBeTruthy();
	});

	test('dismissToast removes a toast by id', () => {
		addToast({ message: 'Test', variant: 'success' });
		const id = getToasts()[0].id;

		dismissToast(id);
		expect(getToasts()).toHaveLength(0);
	});

	test('auto-dismiss removes toast after duration', () => {
		addToast({ message: 'Auto', variant: 'warning', duration: 3000 });
		expect(getToasts()).toHaveLength(1);

		vi.advanceTimersByTime(3001);
		expect(getToasts()).toHaveLength(0);
	});

	test('getToasts returns current toasts', () => {
		addToast({ message: 'First', variant: 'info' });
		addToast({ message: 'Second', variant: 'danger' });

		const toasts = getToasts();
		expect(toasts).toHaveLength(2);
		expect(toasts[0].message).toBe('First');
		expect(toasts[1].message).toBe('Second');
	});
});
