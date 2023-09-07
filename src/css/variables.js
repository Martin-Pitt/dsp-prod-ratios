let CSSVariables = {};

for(let sheet of document.styleSheets)
{
	try { sheet.cssRules } catch(e) { continue }
	
	for(let rule of sheet.cssRules)
	{
		if(rule.selectorText !== ':root') continue;
		let entries = [];
		for(let key of rule.style)
		{
			let value = rule.style.getPropertyValue(key);
			if(!key.startsWith('--')) continue;
			key = key.substr(2).replace(/-([a-z])/ig, (all, letter) => letter.toUpperCase());
			entries.push([key, value]);
		}
		
		let vars = Object.fromEntries(entries);
		Object.assign(CSSVariables, vars);
	}
}

export default CSSVariables;