import { JSONReviver } from '../data/reviver.js';
import tech from '../data/tech.json';
import recipes from '../data/recipes.json';
import items from '../data/items.json';
import strings from '../data/strings.json';


function JSONRecurse(key, value, depth = 0) {
	if(Array.isArray(value))
		value = value.map((item, index) => JSONRecurse(index, item, depth + 1));
	
	else if(typeof value === 'object')
		for(let subKey in value)
			value[subKey] = JSONRecurse(subKey, value[subKey], depth + 1);
	
	return JSONReviver(key, value);
}


export const Strings = JSONRecurse(undefined, strings);

export const supportedLocales = Intl.getCanonicalLocales(
	Object.keys(Strings.entries().next().value[1])
	.map(locale => locale.replace('_', '-'))
);

export const locale = (() => {
	for(const preferred of navigator.languages)
	{
		const match = supportedLocales.find(supported =>
			supported.startsWith(preferred) || preferred.startsWith(supported)
		);
		if(match) return match;
	}
	return 'en-US';
})();
export const internalLocale = locale.replace('-', '_').toLowerCase();
export const translateableKeys = ['name', 'description', 'conclusion', 'miningFrom', 'produceFrom'];
export function translate(input) {
    if(typeof input === 'string') return Strings.get(input)[internalLocale];
    else if(Array.isArray(input)) return input.map(translate);
    else if(typeof input === 'object')
    {
        input = { ...input };
        for(let key in input)
        {
            if(!translateableKeys.includes(key)) continue;
            input[key] = translate(input[key]);
        }
        return input;
    }
    else throw new Error('Undefined behaviour for translate');
}

export const Tech = translate(JSONRecurse(undefined, tech));
export const Recipes = translate(JSONRecurse(undefined, recipes));
export const Items = translate(JSONRecurse(undefined, items));