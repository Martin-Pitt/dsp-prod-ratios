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