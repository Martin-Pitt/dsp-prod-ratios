// Revive the JSON data
// usage: const Items = JSON.parse(json, JSONReviver);
export function JSONReviver(key, value) {
	if(value && typeof value === 'object' && typeof value[':type'] === 'string' && value.value)
	{
		if(value[':type'] === 'BigInt') return BigInt(value.value);
		if(value[':type'] === 'Map') return new Map(value.value);
	}
	
	return value;
}

// Replacer implementation used for stringifying JSON data originally
export function JSONReplacer(key, value) {
	if(typeof value === 'bigint') return { ':type': 'BigInt', value: value.toString() };
	if(value instanceof Map) return { ':type': 'Map', value: Array.from(value.entries()) };
	return value;
}

// For recursively reviving JSON objects
export function JSONRecurse(keyOrJSON, value, depth = 0) {
	if(typeof keyOrJSON === 'object')
	{
		value = keyOrJSON;
		keyOrJSON = undefined;
	}
	
	if(Array.isArray(value))
	{
		value = value.map((item, index) => JSONRecurse(index, item, depth + 1));
	}
	
	else if(typeof value === 'object')
	{
		for(let subKey in value)
		{
			value[subKey] = JSONRecurse(subKey, value[subKey], depth + 1);
		}
	}
	
	return JSONReviver(keyOrJSON, value);
}