// Revive the JSON data
// usage: const Items = JSON.parse(json, JSONReviver);
export function JSONReviver(key, value) {
	if(typeof value === 'object' && typeof value.type === 'string' && value.value)
	{
		if(value.type === 'BigInt')
			return BigInt(value.value);
		if(value.type === 'Map')
			return new Map(value.value);
		else
			return  value;
	}
	else
		return value;
}

// Replacer implementation used for stringifying JSON data originally
export function JSONReplacer(key, value) {
	if(typeof value === 'bigint')
		return { type: 'BigInt', value: value.toString() };
	if(value instanceof Map)
		return { type: 'Map', value: Array.from(value.entries()) };
	
	else return value;
}