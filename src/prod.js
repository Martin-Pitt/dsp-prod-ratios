import { Items, Buildings, Recipes, findRecipeByOutput, findRecipe } from './recipes.js';





export function Production(root, factor = 1, depth = 0) {
	let recipe;
	if(typeof root === 'string')
	{
		// recipe = findRecipeByOutput(root);
		recipe = findRecipe(root);
		if(!recipe) return console.error('Could not find recipe for', root);
	}
	else recipe = root;
	
	const node = { factor, depth, ...recipe };
	if(recipe.process === 'Mining Facility')
	{
		let products = Object.entries(node.output);
		node.output = {};
		for(let [product] of products) {
			if(product !== name)
			{
				if(!node.byproduct) node.byproduct = {};
				node.byproduct[product] = factor;
			}
			
			else
			{
				node.output[product] = factor;
			}
		}
		return node;
	}
	
	node.input = [];
	
	for(let [name, [amount, perMinute]] of Object.entries(recipe.input))
	{
		// let ingredient = findRecipeByOutput(name);
		let ingredient = findRecipe(name);
		if(!ingredient) continue;
		else if(ingredient.process === 'Mining Facility' || ingredient.output[name] === true)
		{
			let subNode = {
				factor,
				depth: depth + 1,
				...ingredient
			};
			
			let products = Object.entries(subNode.output);
			subNode.output = {};
			for(let [product] of products) {
				if(product !== name)
				{
					if(!subNode.byproduct) subNode.byproduct = {};
					subNode.byproduct[product] = [factor, perMinute];
				}
				
				else
				{
					subNode.output[product] = [factor, perMinute];
				}
			}
			
			node.input.push(subNode);
			
			// nodes.push({
			// 	factor: factor * (perMinute / 60),
			// 	depth: depth + 1,
			// 	...ingredient
			// });
		}
		
		else
		{
			let [outAmount, outPerMinute] = ingredient.output[name];
			let subNode = Production(ingredient, factor * (perMinute / outPerMinute), depth + 1);
			
			let { output } = subNode;
			let products = Object.entries(subNode.output);
			subNode.output = {};
			for(let [product, throughput] of products) {
				if(product !== name)
				{
					if(!subNode.byproduct) subNode.byproduct = {};
					subNode.byproduct[product] = throughput;
				}
				
				else
				{
					subNode.output[product] = throughput;
				}
			}
			
			node.input.push(subNode);
		}
	}
	
	return node;
}



export function Chain(root, factor = 1, depth = 0) {
	let recipe;
	if(typeof root === 'string')
	{
		recipe = findRecipeByOutput(root);
		if(!recipe) return console.error('Could not find recipe for', root);
	}
	else recipe = root;
	
	const node = { factor, depth, ...recipe };
	let nodes = [node];
	
	if(recipe.process === 'Mining Facility') return nodes;
	
	for(let [name, [amount, perMinute]] of Object.entries(recipe.input))
	{
		let ingredient = findRecipeByOutput(name);
		if(!ingredient) continue;
		else if(ingredient.process === 'Mining Facility' || ingredient.output[name] === true)
		{
			nodes.push({
				factor: factor * (perMinute / 60),
				depth: depth + 1,
				...ingredient
			});
		}
		
		else
		{
			let [outAmount, outPerMinute] = ingredient.output[name];
			let subNode = Chain(ingredient, factor * (perMinute / outPerMinute), depth + 1);
			nodes.push(...subNode);
		}
	}
	
	return nodes;
}








/*
export function Produce(root, factor = 1, depth = 0) {
	let recipe;
	if(typeof root === 'string')
	{
		recipe = findRecipeByOutput(root);
		if(!recipe) return console.error('Could not find recipe for', root);
	}
	else recipe = root;
	
	
	const prefix = '\t'.repeat(depth); // '·\t'.repeat(depth);
	const log = [];
	const node = { factor, depth, ...recipe };
	
	if(recipe.process === 'Mining Facility')
	{
		for(let [product, [amount, perMinute]] of Object.entries(recipe.output))
		{
			log.push(`< ${perMinute * factor} × ${product} / min`);
		}
		log.push(`: ${+factor.toFixed(4)} × ${recipe.process}`);
		
		// log.push(`< ${+factor.toFixed(4)}×${
		// 	Object.entries(recipe.output).map(([product]) => `[${product}]`).join(', ')
		// }`);
		console.log(log.map(line => prefix + line).join('\n'));
		return node;
	}
	
	node.input = [];
	
	for(let [product, [amount, perMinute]] of Object.entries(recipe.output))
	{
		log.push(`< ${perMinute * factor} × ${product} / min`);
	}
	log.push(`: ${+factor.toFixed(4)} × ${recipe.process}`);
	// log.push(`< ${+factor.toFixed(4)}×${recipe.process} ${
	// 	// Object.entries(recipe.output).map(([product, [amount, perMinute]]) => `[${perMinute}pm ${amount}×${product}]`).join(', ')
	// 	Object.entries(recipe.output).map(([product, [amount, perMinute]]) => `[${perMinute} ${product} / min]`).join(', ')
	// }`);
	
	
	console.log(log.map(line => prefix + line).join('\n'));
	
	
	for(let [name, [amount, perMinute]] of Object.entries(recipe.input))
	{
		// log.push(`> ${perMinute}pm ${amount}×${name}`);
		log.push(`> ${perMinute * factor} × ${name} / min`);
		
		let ingredient = findRecipeByOutput(name);
		if(!ingredient) continue;
		else if(ingredient.process === 'Mining Facility')
		{
			let subNode = Produce(ingredient, factor * (perMinute / 60), depth + 1);
			node.input.push(subNode);
		}
		
		else
		{
			let [outAmount, outPerMinute] = ingredient.output[name];
			let subNode = Produce(ingredient, factor * (perMinute / outPerMinute), depth + 1);
			node.input.push(subNode);
		}
	}
	
	
	
	
	return node;
}
*/




/*
export function Produce(root, factor = 1, depth = 0) {
	if(typeof root === 'string')
	{
		let recipe = findRecipe(root);
		if(!recipe) return console.error('Could not find recipe for', root);
		else root = recipe;
	}
	
	let log = [];
	log.push(`< ${+factor.toFixed(4)}× ${root.output}`);
	
	
	for(let [name, amount] of Object.entries(root.input))
	{
		let material = findRecipe(name);
		if(!material)
		{
			log.push(`\t> ${factor * amount}x ${name}`);
			continue;
		}
		
		if(material.import)
		{
			// log.push(`\t> ${name}`);
			let factories = factor * (amount / material.produced) * (material.duration / root.duration);
			log.push(`\t> ${+factories.toFixed(4)}× ${name}`);
			continue;
		}
		
		let factories = factor * (amount / material.produced) * (material.duration / root.duration);
		log.push(`\t+ ${+factories.toFixed(4)}× ${name}`);
	}
	
	let prefix = '·\t'.repeat(depth);
	console.log(log.map(line => prefix + line).join('\n'));
	
	for(let [name, amount] of Object.entries(root.materials))
	{
		let material = RecipesByName.get(name);
		if(!material || material.import) continue;
		
		let factories = factor * (amount / material.produced) * (material.duration / root.duration);
		
		Produce(material, factories, depth + 1);
	}
}


export function Chain(root, factor = 1, depth = 0) {
	if(typeof root === 'string')
	{
		if(RecipesByName.has(root)) root = RecipesByName.get(root);
		else return console.error('Could not find recipe for', root);
	}
	
	let log = [];
	log.push(`< ${+factor.toFixed(4)}× ${root.name}`);
	
	
	for(let [name, amount] of Object.entries(root.materials))
	{
		let material = RecipesByName.get(name);
		if(!material)
		{
			log.push(`\t> ${name}`);
			continue;
		}
		
		if(material.import)
		{
			log.push(`\t> ${name}`);
			continue;
		}
		
		let factories = factor * (amount / material.produced) * (material.duration / root.duration);
		
		log.push(`\t+ ${+factories.toFixed(4)}× ${name}`); // [${amount}]
	}
	
	let prefix = '·\t'.repeat(depth);
	console.log(log.map(line => prefix + line).join('\n'));
	
	for(let [name, amount] of Object.entries(root.materials))
	{
		let material = RecipesByName.get(name);
		if(!material || material.import) continue;
		
		let factories = factor * (amount / material.produced) * (material.duration / root.duration);
		
		Chain(material, factories, depth + 1);
	}
}
*/



// return an object representing the production chain
/*
{
	
}


*/