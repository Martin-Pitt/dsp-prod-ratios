// const Recipe = {
// 	name: 'Unknown',
// 	process: 'Unknown',
// 	input: { 'Ingredient': [Amount, Per Minute] },
// 	output: { 'Product': [Amount, Per Minute] } || 0
// };

export const Items = [
	
	{ process: 'Mining Facility', output: { 'Iron Ore': true } },
	{ process: 'Mining Facility', output: { 'Copper Ore': true } },
	{ process: 'Mining Facility', output: { 'Silicon Ore': true } },
	{ process: 'Mining Facility', output: { 'Titanium Ore': true } },
	{ process: 'Mining Facility', output: { 'Stone': true } },
	{ process: 'Mining Facility', output: { 'Coal': true } },
	{ process: 'Mining Facility', output: { 'Crude Oil': true } },
	
	
	{
		process: 'Smelting Facility',
		input: { 'Iron Ore': [1, 40] },
		output: { 'Magnet': [1, 40] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Iron Ore': [1, 60] },
		output: { 'Iron Ingot': [1, 60] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Iron Ingot': [3, 60] },
		output: { 'Steel': [1, 20] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Copper Ore': [1, 60] },
		output: { 'Copper Ingot': [1, 60] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Titanium Ore': [2, 60] },
		output: { 'Titanium Ingot': [1, 30] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Stone': [1, 60] },
		output: { 'Stone Brick': [1, 60] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Stone': [2, 60] },
		output: { 'Glass': [1, 30] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Stone': [10, 60] },
		output: { 'Silicon Ore': [1, 6] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Silicon Ore': [2, 60] },
		output: { 'High-purity Silicon': [1, 30] }
	},
	{
		process: 'Smelting Facility',
		input: { 'High-purity Silicon': [1, 30] },
		output: { 'Crystal Silicon': [1, 30] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Coal': [2, 60] },
		output: { 'Energetic Graphite': [1, 30] }
	},
	{
		process: 'Smelting Facility',
		input: { 'Energetic Graphite': [1, 30] },
		output: { 'Diamond': [1, 30] }
	},
	{
		process: 'Smelting Facility', name: 'Diamond (advanced)',
		input: { 'Kimberlite Ore': [1, 40] },
		output: { 'Diamond': [2, 80] },
	},
	{
		process: 'Smelting Facility',
		input: { 'Sulfuric Acid': [8, 40], 'Titanium Ingot': [4, 20], 'Steel': [4, 20] },
		output: { 'Titanium Alloy': [4, 20] }
	},
	
	
	{
		process: 'Chemical Facility',
		input: { 'Refined Oil': [2, 40], 'Energetic Graphite': [1, 20] },
		output: { 'Plastic': [1, 20] },
	},
	{
		process: 'Chemical Facility',
		input: { 'Plastic': [2, 20], 'Refined Oil': [1, 10], 'Water': [1, 10] },
		output: { 'Organic Crystal': [1, 10] }
	},
	{
		process: 'Chemical Facility',
		input: { 'Stone': [8, 80], 'Refined Oil': [6, 60], 'Water': [4, 40] },
		output: { 'Sulfuric Acid': [4, 40] }
	},
	{
		process: 'Chemical Facility',
		input: { 'Energetic Graphite': [3, 60], 'Sulfuric Acid': [1, 20] },
		output: { 'Graphene': [2, 40] }
	},
	{
		process: 'Chemical Facility',
		input: { 'Fire Ice': [2, 60] },
		output: { 'Graphene': [2, 60], 'Hydrogen': [1, 30] }
	},
	{
		process: 'Chemical Facility',
		input: { 'Graphene': [3, 45], 'Titanium Ingot': [1, 15] },
		output: { 'Carbon Nanotube': [2, 30] }
	},
	{
		process: 'Chemical Facility',
		input: { 'Spiniform Stalagmite Crystal': [6, 30] },
		output: { 'Carbon Nanotube': [2, 30] }
	},
	
	
	{
		process: 'Refining Facility', name: 'Plasma Refining',
		input: { 'Crude Oil': [2, 30] },
		output: { 'Hydrogen': [1, 15], 'Refined Oil': [2, 30] }
	},
	{
		process: 'Refining Facility', name: 'X-ray Cracking',
		input: { 'Refined Oil': [1, 15], 'Hydrogen': [1, 30] },
		output: { 'Hydrogen': [3, 45], 'Energetic Graphite': [1, 15] }
	},
	{
		process: 'Refining Facility', name: 'Reforming Refine',
		input: { 'Refined Oil': [2, 30], 'Hydrogen': [1, 15], 'Coal': [1, 15] },
		output: { 'Refined Oil': [3, 45] }
	},
	
	
	{
		process: 'Factionation Facility', name: 'Deuterium Factionation',
		input: { 'Hydrogen': true },
		output: { 'Deuterium': true, 'Hydrogen': true }
	},
	
	{
		process: 'Particle Collider',
		input: { 'Hydrogen': [10, 120] },
		output: { 'Deuterium': [5, 60] }
	},
	{
		process: 'Particle Collider',
		input: { 'Particle Container': [2, 15], 'Iron Ingot': [2, 15], 'Deuterium': [10, 75] },
		output: { 'Strange Matter': [1, 7.5] }
	},
	{
		process: 'Particle Collider', name: 'Mass-energy Storage',
		input: { 'Critical Photon': [2, 60] },
		output: { 'Antimatter': [2, 60], 'Hydrogen': [2, 60] }
	},
	
	
	{
		process: 'Ray Receiver',
		// output: { 'Critical Photon': [1, 6] }
		output: { 'Critical Photon': true }
	},
	
	
	{
		process: 'Research Facility',
		input: { 'Magnetic Coil': [1, 20], 'Circuit Board': [1, 20] },
		output: { 'Electromagnetic Matrix': [1, 20] }
	},
	{
		process: 'Research Facility',
		input: { 'Energetic Graphite': [2, 20], 'Hydrogen': [2, 20] },
		output: { 'Energy Matrix': [1, 10] }
	},
	{
		process: 'Research Facility',
		input: { 'Diamond': [1, 7.5], 'Titanium Crystal': [1, 7.5] },
		output: { 'Structure Matrix': [1, 7.5] }
	},
	{
		process: 'Research Facility',
		input: { 'Processor': [2, 12], 'Particle Broadband': [1, 6] },
		output: { 'Information Matrix': [1, 6] }
	},
	{
		process: 'Research Facility',
		input: { 'Graviton Lens': [1, 2.5], 'Quantum Chip': [1, 2.5] },
		output: { 'Gravity Matrix': [2, 5] }
	},
	{
		process: 'Research Facility',
		input: {
			'Electromagnetic Matrix': [1, 4],
			'Energy Matrix': [1, 4],
			'Structure Matrix': [1, 4],
			'Information Matrix': [1, 4],
			'Gravity Matrix': [1, 4],
			'Antimatter': [1, 4]
		},
		output: { 'Universe Matrix': [1, 5] }
	},
	
	
	{
		process: 'Assembler',
		input: { 'Iron Ingot': [1, 45] },
		output: { 'Gear': [1, 45] }
	},
	{
		process: 'Assembler',
		input: { 'Magnet': [2, 90], 'Copper Ingot': [1, 45] },
		output: { 'Magnetic Coil': [2, 90] }
	},
	{
		process: 'Assembler',
		input: { 'Magnetic Coil': [1, 22.5], 'Gear': [1, 22.5], 'Iron Ingot': [2, 45] },
		output: { 'Electric Motor': [1, 22.5] }
	},
	{
		process: 'Assembler',
		input: { 'Electric Motor': [2, 45], 'Magnetic Coil': [2, 45] },
		output: { 'Electromagnetic Turbine': [1, 22.5] }
	},
	{
		process: 'Assembler',
		input: { 'Electromagnetic Turbine': [2, 30], 'Magnet': [3, 45], 'Energetic Graphite': [1, 15] },
		output: { 'Super-magnetic Ring': [1, 22.5] }
	},
	
	{
		process: 'Assembler',
		input: { 'Glass': [3, 67.5] },
		output: { 'Prism': [2, 45] }
	},
	{
		process: 'Assembler',
		input: { 'Prism': [2, 45], 'Magnetic Coil': [4, 90] },
		output: { 'Plasma Exciter': [1, 22.5] }
	},
	{
		process: 'Assembler',
		input: { 'Prism': [2, 30], 'Circuit Board': [1, 15] },
		output: { 'Photon Combiner': [1, 15] }
	},
	{
		process: 'Assembler',
		input: { 'Optical Grating Crystal': [1, 30], 'Circuit Board': [1, 15] },
		output: { 'Photon Combiner': [1, 15] }
	},
	
	{
		process: 'Assembler',
		input: { 'Titanium Ingot': [3, 33.75], 'Organic Crystal': [1, 11.25] },
		output: { 'Titanium Crystal': [1, 11.25] }
	},
	{
		process: 'Assembler',
		input: { 'Titanium Crystal': [1, 11.25], 'Graphene': [2, 22.5], 'Hydrogen': [12, 135] },
		output: { 'Casimir Crystal': [1, 11.25] }
	},
	{
		process: 'Assembler',
		input: { 'Optical Grating Crystal': [8, 45], 'Graphene': [2, 22.5], 'Hydrogen': [12, 135] },
		output: { 'Casimir Crystal': [1, 11.25] }
	},
	{
		process: 'Assembler',
		input: { 'Glass': [2, 18], 'Titanium': [2, 18], 'Water': [2, 18] },
		output: { 'Titanium Glass': [2, 18] }
	},
	{
		process: 'Assembler',
		input: { 'Titanium Glass': [2, 7.5], 'Casimir Crystal': [1, 3.75] },
		output: { 'Plane Filter': [1, 3.75] }
	},
	
	{
		process: 'Assembler',
		input: { 'Titanium Ingot': [1, 7.5], 'Hydrogen': [10, 75] },
		output: { 'Hydrogen Fuel Rod': [2, 15] }
	},
	{
		process: 'Assembler',
		input: { 'Titanium Alloy': [1, 3.75], 'Super-magnetic Ring': [1, 3.75], 'Deuterium': [20, 75] },
		output: { 'Deuteron Fuel Rod': [2, 7.5] }
	},
	{
		process: 'Assembler',
		input: { 'Titanium Alloy': [1, 1.875], 'Annihilation Constraint Sphere': [1, 1.875], 'Hydrogen': [12, 22.5], 'Antimatter': [12, 22.5] },
		output: { 'Antimatter Fuel Rod': [2, 3.75] }
	},
	
	{
		process: 'Assembler',
		input: { 'Coal': [1, 90] },
		output: { 'Proliferator Mk.I': [1, 90] }
	},
	{
		process: 'Assembler',
		input: { 'Proliferator Mk.I': [2, 90], 'Diamond': [1, 45] },
		output: { 'Proliferator Mk.II': [1, 45] }
	},
	{
		process: 'Assembler',
		input: { 'Proliferator Mk.II': [2, 45], 'Carbon Nanotube': [1, 22.5] },
		output: { 'Proliferator Mk.III': [1, 22.5] }
	},
	
	{
		process: 'Assembler',
		input: { 'Iron Ingot': [2, 90], 'Copper Ingot': [1, 45] },
		output: { 'Circuit Board': [2, 90] }
	},
	{
		process: 'Assembler',
		input: { 'High-purity Silicon': [2, 45], 'Copper Ingot': [1, 22.5] },
		output: { 'Microcrystalline Component': [1, 22.5] }
	},
	{
		process: 'Assembler',
		input: { 'Circuit Board': [2, 30], 'Microcrystalline Component': [2, 30] },
		output: { 'Processor': [1, 15] }
	},
	{
		process: 'Assembler',
		input: { 'Processor': [2, 15], 'Plane Filter': [2, 15] },
		output: { 'Quantum Chip': [1, 7.5] }
	},
	
	
	{
		process: 'Assembler',
		input: { 'Electromagnetic Turbine': [2, 22.5], 'Graphene': [2, 22.5], 'Copper Ingot': [2, 22.5] },
		output: { 'Particle Container': [1, 11.25] }
	},
	{
		process: 'Assembler', name: 'Particle Container (advanced)',
		input: { 'Unipolar Magnet': [10, 122.5], 'Copper Ingot': [2, 22.5] },
		output: { 'Particle Container': [1, 11.25] }
	},
	{
		process: 'Assembler',
		input: { 'Particle Container': [1, 2.25], 'Processor': [1, 2.25] },
		output: { 'Annihilation Constraint Sphere': [1, 2.25] }
	},
	{
		process: 'Assembler',
		input: { 'Diamond': [4, 30], 'Strange Matter': [1, 7.5] },
		output: { 'Graviton Lens': [1, 7.5] }
	},
	{
		process: 'Assembler',
		input: { 'Warp Lens': [1, 4.5] },
		output: { 'Space Warper': [1, 4.5] }
	},
	{
		process: 'Assembler',
		input: { 'Structure Matrix': [1, 4.5] },
		output: { 'Space Warper': [8, 36] }
	},
	{
		process: 'Assembler',
		input: { 'Carbon Nanotube': [2, 11.25], 'Crystal Silicon': [2, 11.25], 'Plastic': [1, 5.625] },
		output: { 'Particle Broadband': [1, 5.625] }
	},
	
	
	
	{
		process: 'Assembler',
		input: { 'Copper Ingot': [3, 33.75], 'Steel': [2, 22.5] },
		output: { 'Thruster': [1, 11.25] }
	},
	{
		process: 'Assembler',
		input: { 'Titanium Alloy': [5, 37.5], 'Electromagnetic Turbine': [5, 37.5] },
		output: {'Reinforced Thruster': [1, 7.5] }
	},
	
	{
		process: 'Assembler',
		input: { 'Iron Ingot': [2, 60], 'Electromagnetic Turbine': [1, 30], 'Processor': [1, 30] },
		output: { 'Logistics Bot': [1, 30] }
	},
	{
		process: 'Assembler',
		input: { 'Iron Ingot': [5, 56.25], 'Processor': [2, 22.5], 'Thruster': [2, 22.5] },
		output: { 'Logistics Drone': [1, 11.25] }
	},
	{
		process: 'Assembler',
		input: { 'Titanium Alloy': [10, 75], 'Processor': [10, 75], 'Reinforced Thruster': [2, 15] },
		output: { 'Logistics Vessel': [1, 7.5] }
	},
	
	{
		process: 'Assembler',
		input: { 'Graphene': [1, 11.25], 'Photon Combiner': [1, 11.25] },
		output: { 'Solar Sail': [2, 22.5] }
	},
	{
		process: 'Assembler',
		input: { 'Carbon Nanotube': [4, 30], 'Titanium Alloy': [1, 7.5], 'High-purity Silicon': [1, 7.5] },
		output: { 'Frame Material': [1, 7.5] }
	},
	{
		process: 'Assembler',
		input: { 'Frame Material': [3, 16.875], 'Solar Sail': [3, 16.875], 'Processor': [3, 16.875] },
		output: { 'Dyson Sphere Component': [1, 5.625] }
	},
	{
		process: 'Assembler',
		input: { 'Dyson Sphere Component': [2, 15], 'Deuteron Fuel Rod': [4, 30], 'Quantum Chip': [2, 15] },
		output: { 'Small Carrier Rocket': [1, 7.5] }
	},
	
	
	
	{
		process: 'Assembler', name: 'Crystal Silicon (advanced)',
		input: { 'Fractal Silicon': [1, 30] },
		output: { 'Crystal Silicon': [2, 60] }
	},
	{
		process: 'Assembler',
		input: { 'Stone Brick': [3, 135], 'Steel': [1, 45] },
		output: { 'Foundation': [1, 45] }
	},
];//.map(d => Object.assign(Object.create(Recipe), d));


export const Buildings = [
	{
		name: 'Arc Smelter',
		type: 'Production',
		input: { 'Circuit Board': [4, 60], 'Iron Ingot': [4, 60], 'Magnetic Coil': [2, 30], 'Stone Brick': [2, 30] },
		output: { 'Arc Smelter': [1, 15] },
	},
	{
		name: 'Plane Smelter',
		type: 'Production',
		input: { 'Unipolar Magnet': [15, 135], 'Frame Materials': [5, 45], 'Plane Filter': [4, 36], 'Arc Smelter': [1, 9] },
		output: { 'Plane Smelter': [1, 9] },
	},
	{
		name: 'Assembling Machine Mk.I',
		type: 'Production',
		input: { 'Gear': [8, 180], 'Circuit Board': [4, 90], 'Iron Ingot': [4, 90] },
		output: { 'Assembling Machine Mk.I': [1, 22.5] }
	},
	{
		name: 'Assembling Machine Mk.II',
		type: 'Production',
		input: { 'Graphene': [8, 120], 'Processor': [4, 60], 'Assembling Machine Mk.I': [1, 15] },
		output: { 'Assembling Machine Mk.II': [1, 15] }
	},
	{
		name: 'Assembling Machine Mk.III',
		type: 'Production',
		input: { 'Particle Broadband': [8, 90], 'Quantum Chip': [2, 22.5], 'Assembling Machine Mk.II': [1, 11.25] },
		output: { 'Assembling Machine Mk.III': [1, 11.25] }
	},
	{
		name: 'Spray Coater',
		type: 'Production',
		input: { 'Steel': [4, 60], 'Circuit Board': [2, 30], 'Microcrystalline Component': [2, 30], 'Plasma Exciter': [2, 30] },
		output: { 'Spray Coater': [1, 15] }
	},
	{
		name: 'Matrix Lab',
		type: 'Production',
		input: { 'Iron Ingot': [8, 120], 'Circuit Board': [4, 60], 'Glass': [4, 60], 'Magnetic Coil': [4, 60] },
		output: { 'Matrix Lab': [1, 15] }
	},
	{
		name: 'Oil Refinery',
		type: 'Production',
		input: { 'Steel': [10, 75], 'Stone Brick': [10, 75], 'Circuit Board': [6, 45], 'Plasma Exciter': [6, 45] },
		output: { 'Oil Refinery': [1, 7.5] }
	},
	{
		name: 'Chemical Plant',
		type: 'Production',
		input: { 'Glass': [8, 72], 'Steel': [8, 72], 'Stone Brick': [8, 72], 'Circuit Board': [2, 18] },
		output: { 'Chemical Plant': [1, 9] }
	},
	{
		name: 'Fractionator',
		type: 'Production',
		materials: { 'Steel': [8, 120], 'Glass': [4, 60], 'Stone Brick': [4, 60], 'Processor': [1, 15] },
		output: { 'Fractionator': [1, 15] }
	},
	{
		name: 'Miniature Particle Collider',
		type: 'Production',
		input: { 'Super-magnetic Ring': [50, 150], 'Frame Material': [20, 60], 'Titanium Alloy': [20, 60], 'Graphene': [10, 30], 'Processor': [8, 24] },
		output: { 'Miniature Particle Collider': [1, 3] }
	},
	
	
	{
		name: 'Mining Machine',
		type: 'Resource Extraction',
		input: { 'Iron Ingot': [4, 60], 'Circuit Board': [2, 30], 'Gear': [2, 30], 'Magnetic Coil': [2, 30] },
		output: { 'Mining Machine': [1, 15] }
	},
	{
		name: 'Advanced Mining Machine',
		type: 'Resource Extraction',
		input: { 'Optical Grating Crystal': [40, 90], 'Titanium Alloy': [20, 45], 'Frame Materials': [10, 22.5], 'Super-magnetic Ring': [10, 22.5], 'Quantum Chip': [4, 9] },
		output: { 'Advanced Mining Machine': 2.25 }
	},
	{
		name: 'Oil Extractor',
		type: 'Resource Extraction',
		input: { 'Steel': [12, 67.5], 'Stone Brick': [12, 67.5], 'Circuit Board': [6, 33.75], 'Plasma Exciter': [4, 22.5] },
		output: { 'Oil Extractor': [1, 5.625] }
	},
	{
		name: 'Water Pump',
		type: 'Resource Extraction',
		input: { 'Iron Ingot': [8, 90], 'Electric Motor': [4, 45], 'Stone Brick': [4, 45], 'Circuit Board': [2, 22.5] },
		output: { 'Water Pump': [1, 11.25] }
	},
	{
		name: 'Orbital Collector',
		type: 'Resource Extraction',
		input: { 'Super-magnetic Ring': [50, 75], 'Accumulator': [20, 30], 'Reinforced Thruster': [20, 30], 'Interstellar Logistics Station': [1, 1.5] },
		output: { 'Orbital Collector': [1, 1.5] }
	},
	
	
	{
		name: 'Tesla Tower',
		type: 'Power',
		input: { 'Iron Ingot': [2, 90], 'Magnetic Coil': [1, 45] },
		output: { 'Tesla Tower': [45] }
	},
	{
		name: 'Wireless Power Tower',
		type: 'Power',
		input: { 'Plasma Exciter': [3, 45], 'Tesla Tower': [1, 15] },
		output: { 'Wireless Power Tower': [1, 15]}
	},
	{
		name: 'Satellite Substation',
		type: 'Power',
		input: { 'Super-magnetic Ring': [10, 90], 'Frame Materials': [2, 18], 'Wireless Power Tower': [1, 9] },
		output: { 'Satellite Substation': [1, 9] }
	},
	{
		name: 'Wind Turbine',
		type: 'Power',
		input: { 'Iron Ingot': [6, 67.5], 'Magnetic Coil': [3, 33.75], 'Gear': [1, 11.25] },
		output: { 'Wind Turbine': [1, 11.25] }
	},
	{
		name: 'Solar Panel',
		type: 'Power',
		input: { 'Copper Ingot': [10, 90], 'High-purity Silicon': [10, 90], 'Circuit Board': [5, 45] },
		output: { 'Solar Panel': [1, 9] }
	},
	{
		name: 'Thermal Power Plant',
		type: 'Power',
		input: { 'Iron Ingot': [10, 90], 'Gear': [4, 36], 'Magnetic Coil': [4, 36], 'Stone Brick': [4, 36] },
		output: { 'Thermal Power Plant': [1, 9] }
	},
	{
		name: 'Geothermal Power Station',
		type: 'Power',
		input: { 'Copper Ingot': [20, 150], 'Steel': [15, 112.5], 'Photon Combiner': [4, 30], 'Super-magnetic Ring': [1, 7.5] },
		output: { 'Geothermal Power Station': [1, 4.5] }
	},
	{
		name: 'Mini Fusion Power Plant',
		type: 'Power',
		input: { 'Titanium Alloy': [12, 54], 'Super-magnetic Ring': [10, 45], 'Carbon Nanotube': [8, 36], 'Processor': [4, 18] },
		output: { 'Mini Fusion Power Plant': [1, 4.5] }
	},
	{
		name: 'Accumulator',
		type: 'Power',
		input: { 'Crystal Silicon': [6, 54], 'Iron Ingot': [6, 54], 'Super-magnetic Ring': [1, 9] },
		output: { 'Accumulator': [1, 9] }
	},
	{
		name: 'Energy Exchanger',
		type: 'Power',
		input: { 'Processor': [40, 120], 'Steel': [40, 120], 'Titanium Alloy': [40, 120], 'Particle Container': [8, 24] },
		output: { 'Energy Exchanger': [1, 3] }
	},
	{
		name: 'Ray Receiver',
		type: 'Power',
		input: { 'High-purity Silicon': [20, 112.5], 'Steel': [20, 112.5], 'Super-magnetic Ring': [20, 112.5], 'Photon Combiner': [10, 56.25], 'Processor': [5, 28.125] },
		output: { 'Ray Receiver': [1, 5.625] }
	},
	{
		name: 'Artificial Star',
		type: 'Power',
		input: { 'Frame Materials': [20, 30], 'Titanium Alloy': [20, 30], 'Annihilation Constraint Sphere': [10, 15], 'Quantum Chip': [10, 15] },
		output: { 'Artificial Star': [1, 1.5] }
	},
	
	
	{
		name: 'Conveyor Belt MK.I',
		type: 'Logistics',
		input: { 'Iron Ingot': [2, 90], 'Gear': [1, 45] },
		output: { 'Conveyor Belt MK.I': [1, 135] }
	},
	{
		name: 'Conveyor Belt MK.II',
		type: 'Logistics',
		input: { 'Conveyor Belt MK.I': [3, 135], 'Electromagnetic Turbine': [1, 45] },
		output: { 'Conveyor Belt MK.II': [1, 135] }
	},
	{
		name: 'Conveyor Belt MK.III',
		type: 'Logistics',
		input: { 'Conveyor Belt MK.II': [3, 135], 'Graphene': [1, 45], 'Super-magnetic Ring': [1, 45] },
		output: { 'Conveyor Belt MK.III': [1, 135] }
	},
	{
		name: 'Sorter MK.I',
		type: 'Logistics',
		input: { 'Circuit Board': [1, 45], 'Iron Ingot': [1, 45] },
		output: { 'Sorter MK.I': [1, 45] }
	},
	{
		name: 'Sorter MK.II',
		type: 'Logistics',
		input: { 'Sorter MK.I': [2, 90], 'Electric Motor': [1, 45] },
		output: { 'Sorter MK.II': [1, 90] }
	},
	{
		name: 'Sorter MK.III',
		type: 'Logistics',
		input: { 'Sorter MK.II': [2, 90], 'Electromagnetic Turbine': [1, 45] },
		output: { 'Sorter MK.III': [1, 90] }
	},
	{
		name: 'Splitter',
		type: 'Logistics',
		input: { 'Iron Ingot': [3, 67.5], 'Gear': [2, 45], 'Circuit Board': [1, 22.5] },
		output: { 'Splitter': [1, 22.5] }
	},
	{
		name: 'Traffic Monitor',
		type: 'Logistics',
		input: { 'Iron Ingot': [3, 67.5], 'Circuit Board': [2, 45], 'Gear': [2, 45], 'Glass': [1, 22.5] },
		output: { 'Traffic Monitor': [1, 22.5] }
	},
	{
		name: 'Automatic Piler',
		type: 'Logistics',
		input: { 'Gear': [4, 45], 'Steel': [3, 33.75], 'Processor': [2, 22.5], 'Super-magnetic Ring': [1, 11.25] },
		output: { 'Automatic Piler': [1, 11.25] }
	},
	{
		name: 'Logistics Distributor',
		type: 'Logistics',
		input: { 'Iron Ingot': [6, 45], 'Plasma Exciter': [4, 30], 'Processor': [4, 30] },
		output: { 'Logistics Distributor': [1, 7.5] }
	},
	{
		name: 'Planetary Logistics Station',
		type: 'Logistics',
		input: { 'Processor': [40, 90], 'Steel': [40, 90], 'Titanium Ingot': [40, 90], 'Particle container': [20, 45] },
		output: { 'Planetary Logistics Station': [1, 2.25] }
	},
	{
		name: 'Interstellar Logistics Station',
		type: 'Logistics',
		input: { 'Particle Container': [20, 75], 'Titanium Alloy': [50, 30], 'Planetary Logistics Station': [1, 1.5] },
		output: { 'Interstellar Logistics Station': [1, 1.5] }
	},
	
	
	{
		name: 'Storage MK.I',
		type: 'Storage',
		input: { 'Iron Ingot': [4, 90], 'Stone Brick': [4, 90] },
		output: { 'Storage MK.I': [1, 22.5] }
	},
	{
		name: 'Storage MK.II',
		type: 'Storage',
		input: { 'Steel': [8, 90], 'Stone Brick': [8, 90] },
		output: { 'Storage MK.II': [1, 11.25] }
	},
	{
		name: 'Storage Tank',
		type: 'Storage',
		input: { 'Iron Ingot': [8, 180], 'Glass': [4, 90], 'Stone Brick': [4, 90] },
		output: { 'Storage Tank': [1, 22.5] }
	},
	
	
	{
		name: 'EM-Rail Ejector',
		type: 'Dyson Sphere',
		input: { 'Gear': [20, 150], 'Steel': [20, 150], 'Super-magnetic Ring': [10, 75], 'Processor': [5, 37.5] },
		output: { 'EM-Rail Ejector': [1, 7.5] }
	},
	{
		name: 'Vertical Launching Silo',
		type: 'Dyson Sphere',
		input: { 'Titanium Alloy': [80, 120], 'Frame Materials': [30, 45], 'Warp Lens': [20, 30], 'Quantum Chip': [10, 15] },
		output: { 'Vertical Launching Silo': [1, 1.5] }
	},
].map(d => Object.assign({ process: 'Assembler' }, d));
//.map(d => Object.assign(Object.create(Recipe), d));


// export const BuildingsByName = new Map(Buildings.map(d => [d.name, d]));
// export const Recipes = Items.concat(Buildings);
// export const RecipesByName = new Map(Recipes.map(d => [d.name, d]));

export const Recipes = Items.concat(Buildings);

export function findRecipeByOutput(item) {
	return Recipes.find(recipe => item in recipe.output);
}


/*

Check for case sensitivity issues:

	Array.from(
		new Set(Items.flatMap(item => (item.input? Object.keys(item.input) : []).concat(Object.keys(item.output))).sort())
	).filter((item, index, array) => 
		array.map(d => d.toLowerCase()).filter(d => d === item.toLowerCase()).length > 1
	);

*/