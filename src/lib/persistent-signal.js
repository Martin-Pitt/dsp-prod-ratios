import { signal, effect } from '@preact/signals-core';

export function persistentSignal(
	key,
	initialValue,
	{
		storage = localStorage,
		restore,
		persist,
	} = {
		storage: localStorage
	},
) {
	const sig = signal(initialValue);
	let skipSave = true;
	
	// try to hydrate state from storage:
	function load() {
		skipSave = true;
		try {
			let stored = JSON.parse(storage.getItem(key));
			if(stored && restore) stored = restore(stored);
			sig.value = stored || initialValue;
		} catch (err) {
			// ignore blocked storage access
		}
		skipSave = false;
	}
	
	effect(() => {
		let value = sig.value;
		if (skipSave) return;
		try {
			if(persist) value = persist(value);
			storage.setItem(key, JSON.stringify(value));
		} catch (err) {
			// ignore blocked storage access
		}
	});
	
	// if another tab changes the launch tracking state, update our in-memory copy:
	if (typeof globalThis.addEventListener === 'function') {
		globalThis.addEventListener('storage', event => {
			if (event.storageArea === storage && event.key === key) load();
		});
	}
	
	load();
	return sig;
}

export function temporarySignal(key, initialValue, {...options } = {}) {
	return persistentSignal(key, initialValue, { ...options, storage: sessionStorage });
}
