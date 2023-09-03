let CSSVariables = {};

for(let sheet of document.styleSheets)
{
	try { sheet.rules } catch(e) { continue }
	
	for(let rule of sheet.rules)
	{
		if(rule.selectorText !== ':root') continue;
		let entries = rule.styleMap.entries();
		entries = Array
			.from(entries, ([key, value]) => [key, value.toString()])
			.filter(([key]) => key.startsWith('--'))
			.map(([key, value]) => [
				key.substr(2).replace(/-([a-z])/ig, (all, letter) => letter.toUpperCase()),
				value
			]);
		let vars = Object.fromEntries(entries);
		Object.assign(CSSVariables, vars);
	}
}

export default CSSVariables;