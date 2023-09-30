import { useState, useCallback, useMemo, useRef, useEffect } from 'preact/hooks';
import { signal, computed } from '@preact/signals';
import classNames from 'classnames';
import { Recipes, Techs, TechsByID } from '../lib/data.js';
import state from '../state.js';
import CSSVariables from '../css/variables.js';
import ScrollableGrid from '../components/scrollable-grid.jsx';




function pinResearch(tech) {
	if(state.research.value.includes(tech)) return;
	if(tech.items) for(let item of tech.items) {
		let itemRecipe = Recipes.find(recipe => recipe.results.includes(item));
		let itemTech = Techs.find(tech => tech.unlockRecipes?.includes(itemRecipe.id));
		if(itemTech) pinResearch(itemTech);
	}
	if(tech.preTechs) for(let preTech of tech.preTechs) pinResearch(TechsByID.get(preTech));
	if(tech.preTechsImplicit) for(let preTech of tech.preTechsImplicit) pinResearch(TechsByID.get(preTech));
	state.research.value = [...state.research.value, tech];
}

function unpinResearch(tech) {
	let index = state.research.value.indexOf(tech);
	if(index === -1) return;
	state.research.value = state.research.value.filter(t => t !== tech);
	
	for(let postTech of state.research.value)
	{
		if(postTech.preTechs?.includes(tech.id)) unpinResearch(postTech);
		if(postTech.preTechsImplicit?.includes(tech.id)) unpinResearch(postTech);
	}
	
	if(tech.unlockRecipes) for(let id of tech.unlockRecipes)
	{
		let recipe = Recipes.find(recipe => recipe.id === id);
		for(let postTech of state.research.value)
			if(postTech.items?.some(item => recipe.results?.includes(item)))
				unpinResearch(postTech);
	}
}

function hoverResearch(tech, set = new Set()) {
	// if(state.research.value.includes(tech)) return set;
	set.add(tech);
	if(tech.preTechs) for(let preTech of tech.preTechs) hoverResearch(TechsByID.get(preTech), set);
	if(tech.preTechsImplicit) for(let preTech of tech.preTechsImplicit) hoverResearch(TechsByID.get(preTech), set);
	if(tech.items) for(let item of tech.items) {
		let itemRecipe = Recipes.find(recipe => recipe.results.includes(item));
		let itemTech = Techs.find(tech => tech.unlockRecipes?.includes(itemRecipe.id));
		if(itemTech) hoverResearch(itemTech, set);
	}
	return set;
}

function toggleResearch(tech) {
	if(state.research.value.includes(tech)) unpinResearch(tech);
	else pinResearch(tech);
}

function onResearch(event, tech) {
	event.preventDefault();
	toggleResearch(tech);
}

function resetResearch() {
	state.research.value = [];
}

function getEpochTechs(epoch) {
	return Techs.filter(tech =>
		tech.id < 2000 &&
		tech.items?.every(item => item <= epoch) &&
		(epoch === 6000? true :
			tech.items.some(item => item === epoch)
		)
	);
}

function getTechEpoch(tech) {
	if(tech.id >= 2000) return null;
	let matrices = tech.items?.filter(item => item >= 6000 && item <= 6099 /* NOTE: Not clear how far ID range for matrixes go */)
	return (matrices && matrices[matrices.length - 1]) || 6000;
}

function toggleShowEpoch() {
	state.showMatrixEpoch.value = !state.showMatrixEpoch.value;
}



const hovered = signal(null);
const hoveredTech = computed(() => hovered.value? hoverResearch(hovered.value) : new Set());



function Tile(props) {
	const { tech } = props;
	const isResearched = state.research.value.includes(tech);
	const hasPreTechs = !tech.preTechs || tech.preTechs.every(id => state.research.value.includes(TechsByID.get(id)));
	const hasImplicitPreTechs = !tech.preTechsImplicit || tech.preTechsImplicit.every(id => state.research.value.includes(TechsByID.get(id)));
	const epoch = state.showMatrixEpoch.value? getTechEpoch(tech) : undefined;
	
	return (
		<div
			key={tech.id}
			class={classNames('tech', {
				'is-researched': isResearched,
				'can-research': hasPreTechs && hasImplicitPreTechs,
				'hovered': hoveredTech.value.has(tech),
			})}
			data-id={tech.id}
			style={{ gridArea: `${tech.y} / ${tech.x}` }}
			data-epoch={epoch}
			onClick={event => onResearch(event, tech)}
			onPointerEnter={event => hovered.value = tech}
			onPointerLeave={event => hovered.value = null}
		>
			<span class="name">{tech.name}</span>
			<div class="tile">
				<div class="icon tech" data-icon={`tech.${tech.id}`}/>
				{/* {epoch && epoch > 6000? <div class="icon epoch" data-icon={`item.${epoch}`}/> : null} */}
			</div>
		</div>
	);
}

function Tiles(props) {
	return props.techs.map(tech => <Tile tech={tech}/>);
}

function Wires(props) {
	const { techs, columns, rows } = props;
	const root = useRef(null);
	
	useEffect(() => {
		const layout = {
			tile: { width: 100, height: 60 },
			gap: { columns: 60, rows: 40 },
			step: 4,
			mainLine: techs.find(tech => tech.isMain).y,
		};
		
		
		// Setup tiles & wires
		const wires = [];
		const tiles = techs.map(tech => {
			let tile = {
				tech,
				in: [],
				out: [],
				x: (tech.x-1) * layout.tile.width + Math.max(0, tech.x - 1) * layout.gap.columns,
				y: (tech.y-1) * layout.tile.height + Math.max(0, tech.y - 1) * layout.gap.rows,
				isMain: tech.isMain,
			};
			
			if(tech.preTechs) tile.in = tech.preTechs.map((preTech, index) => {
				let wire = {
					from: null,
					to: tile,
					fi: 0, fx: 0, fy: 0,
					vx: 0,
					ti: index, tx: 0, ty: 0,
				};
				wires.push(wire);
				return wire;
			});
			
			return tile;
		});
		
		for(let wire of wires)
		{
			let preTech = wire.to.tech.preTechs[wire.ti];
			let tile = tiles.find(tile => tile.tech.id === preTech);
			wire.from = tile;
			wire.fi = tile.out.length;
			tile.out.push(wire);
		}
		
		for(let tile of tiles)
		{
			tile.in.sort((a, b) => a.from.y - b.from.y);
			tile.out.sort((a, b) => a.to.y - b.to.y);
			tile.in.forEach((wire, index) => wire.ti = index);
			tile.out.forEach((wire, index) => wire.fi = index);
		}
		
		
		// Setup wire coords
		for(let tile of tiles)
		{
			const outCenterIndex = Math.max(0, tile.out.findIndex(wire => wire.from.y === wire.to.y));
			const outCenterOffset = outCenterIndex * -layout.step;
			for(let wire of tile.out)
			{
				const isAbove = wire.from.y > wire.to.y;
				const isBelow = wire.from.y < wire.to.y;
				const wireOffset = wire.fi * layout.step;
				
				wire.fx = wire.from.x + layout.tile.width;
				wire.fy = wire.from.y + 20 + wireOffset + outCenterOffset;
				wire.vx = wire.fx + 35;
				
				if(tile.isMain && isAbove) wire.fy -= 4;
				if(tile.isMain && isBelow) wire.fy += 4;
			}
			
			const inCenterIndex = Math.max(0, tile.in.findIndex(wire => wire.from.y === wire.to.y));
			const inCenterOffset = inCenterIndex * -layout.step;
			for(let wire of tile.in)
			{
				const isAbove = wire.to.y > wire.from.y;
				const isBelow = wire.to.y < wire.from.y;
				const wireOffset = wire.ti * layout.step;
				
				wire.tx = wire.to.x;
				wire.ty = wire.to.y + 20 + wireOffset + inCenterOffset;
				
				if(tile.isMain && isAbove) wire.ty -= 4;
				if(tile.isMain && isBelow) wire.ty += 4;
			}
		}
		
		
		// Figure out overlapping wires and separate out the vertical lines
		const bundles = wires.reduce((bundles, wire) => {
			if(wire.fy === wire.ty) return bundles;
			
			let miny = Math.min(wire.fy, wire.ty);
			let maxy = Math.max(wire.fy, wire.ty);
			
			let bundle = bundles.find(bundle =>
				bundle.x === wire.fx && maxy >= bundle.miny && miny <= bundle.maxy
			);
			
			// Create new bundle with bounding extents of wire
			if(!bundle)
			{
				bundles.push({
					x: wire.fx,
					miny,
					maxy,
					wires: [wire],
				});
			}
			
			// Add wire to bundle & update bounding extents
			else
			{
				bundle.miny = Math.min(bundle.miny, miny);
				bundle.maxy = Math.max(bundle.maxy, maxy);
				bundle.wires.push(wire);
			}
			
			return bundles;
		}, []).reduce((bundles, a) => {
			
			let b = bundles.find(b => 
				a.x === b.x && a.maxy >= b.miny && a.miny <= b.maxy
			);
			
			if(b)
			{
				b.miny = Math.min(b.miny, a.miny);
				b.maxy = Math.max(b.maxy, a.maxy);
				b.wires = b.wires.concat(a.wires);
			}
			
			else
			{
				bundles.push(a);
			}
			
			return bundles;
		}, []);
		
		for(let bundle of bundles)
		{
			if(bundle.wires.length === 1) continue;
			
			bundle.wires.sort((a, b) => a.ty - b.ty);
			
			for(let iter = 0; iter < bundle.wires.length; ++iter)
			{
				const wire = bundle.wires[iter];
				const isAbove = wire.from.y > wire.to.y;
				const isBelow = wire.from.y < wire.to.y;
				if(isAbove) wire.vx += iter * layout.step - bundle.wires.length * layout.step * 0.5;
				if(isBelow) wire.vx -= iter * layout.step;
			}
		}
		
		
		// Setup canvas
		let dPR = window.devicePixelRatio;
		let width = columns * layout.tile.width + (columns-1) * layout.gap.columns;
		let height = rows * layout.tile.height + (rows-1) * layout.gap.rows;
		root.current.width = width * dPR;
		root.current.height = height * dPR;
		root.current.style.width = `${width}px`;
		root.current.style.height = `${height}px`;
		const ctx = root.current.getContext('2d');
		ctx.translate(0.5, 0.5);
		ctx.scale(dPR, dPR);
		
		
		// Render canvas
		wires.sort((a, b) => {
			a = state.research.value.includes(a.to.tech);
			b = state.research.value.includes(b.to.tech);
			if(a && b) return 0;
			if(a) return 1;
			if(b) return -1;
			return 0;
		});
		
		for(let wire of wires)
		{
			const isActive = state.research.value.includes(wire.to.tech);
			const isHovered = hoveredTech.value.has(wire.to.tech);
			
			ctx.fillStyle = ctx.strokeStyle =
				// isHovered && isActive? CSSVariables.techLinkResearchedHovered: 
				isActive? CSSVariables.techLinkResearched:
				isHovered? CSSVariables.techLinkHovered:
				CSSVariables.techLinkUnavailable;
			ctx.lineWidth = wire.from.isMain && wire.to.isMain? 10.0 : 2.0;
			
			if(wire.from.isMain && wire.to.isMain)
			{
				ctx.beginPath();
				ctx.moveTo(wire.fx, wire.fy);
				ctx.lineTo(wire.vx, wire.fy);
				ctx.lineTo(wire.vx, wire.ty);
				ctx.lineTo(wire.tx, wire.ty);
				ctx.stroke();
				
				ctx.fillStyle = isActive? 'lch(20 0 0)' : 'lch(55 0 0)';
				ctx.font = '600 8px/14px Saira, sans-serif';
				ctx.fontStretch = 'condensed'; // '110%';
				ctx.fillText('Main quest', wire.fx + 6, wire.fy + 2.5);
			}
			
			else
			{
				const arrow = {
					width: 8,
					height: 3,
					offset: isActive? -3 : 0,
				};
				ctx.beginPath();
				ctx.moveTo(wire.fx, wire.fy);
				ctx.lineTo(wire.vx, wire.fy);
				ctx.lineTo(wire.vx, wire.ty);
				ctx.lineTo(wire.tx - arrow.width + arrow.offset, wire.ty);
				ctx.stroke();
				
				ctx.beginPath();
				ctx.moveTo(wire.tx + arrow.offset, wire.ty);
				ctx.lineTo(wire.tx + arrow.offset - arrow.width, wire.ty - arrow.height);
				ctx.lineTo(wire.tx + arrow.offset - arrow.width, wire.ty + arrow.height);
				ctx.closePath();
				ctx.fill();
			}
		}
		
		
		
		
		/*
		for(let tech of techs)
		{
			if(!tech.postTechs) continue;
			let [x, y] = getTilePos(tech);
			
			const hasPostTechs = !tech.postTechs || tech.postTechs.every(id => state.research.value.includes(TechsByID.get(id)));
			// const hasImplicitPreTechs = !tech.preTechsImplicit || tech.preTechsImplicit.every(id => state.research.value.includes(TechsByID.get(id)));
			const isMain = tech.y === mainLinePosition;
			let postTechs = tech.postTechs.map(id => TechsByID.get(id));
			const inLineIndex = postTechs.findIndex(postTech => postTech.y === tech.y);
			const inLineOffset = inLineIndex !== -1? inLineIndex * -step : 0;
			
			for(let iter = 0; iter < postTechs.length; ++iter)
			{
				let postTech = postTechs[iter];
				let [px, py] = getTilePos(postTech);
				
				const isActive = state.research.value.includes(postTech);
				const isBelow = tech.y < postTech.y;
				const isAbove = tech.y > postTech.y;
				const inLine = tech.y === postTech.y;
				const isHovered = hoveredTech.value.has(postTech);
				
				// Line drawing styles
				ctx.strokeStyle = isHovered && isActive? CSSVariables.techLinkResearchedHovered: 
									isHovered? CSSVariables.techLinkHovered:
									isActive? CSSVariables.techLinkResearched:
									CSSVariables.techLinkUnavailable;
				ctx.lineWidth = isMain && inLine? 10.0 : 1.0;
				
				// Setup tile input and output port origins
				let cx = x + tile.width;
				let cy = y + 20;
				py += 20;
				
				if(isMain && isAbove) { cy -= 4; py -= 4; }
				if(isMain && isBelow) { cy += 4; py += 4; }
				
				let ox = Math.abs(inLineIndex - iter) * -step;
				let oy = iter * step + inLineOffset;
				
				
				// Draw
				ctx.beginPath();
				ctx.moveTo(cx, cy + oy);
				ctx.lineTo(cx + 35 + ox, cy + oy);
				ctx.lineTo(cx + 35 + ox, py);
				ctx.lineTo(px - 25, py);
				ctx.lineTo(px, py);
				ctx.stroke();
			}
		}
		*/
	}, [state.research.value, hoveredTech.value]);
	
	return <canvas ref={root}/>
}

export default function Research(props) {
	const [techs, columns, rows] = useMemo(() => {
		const techs = Techs.filter(tech => tech.id < 2000);
		let techsX = techs.map(tech => tech.x);
		let techsY = techs.map(tech => tech.y);
		const columns = Math.max(...techsX);
		const rows = Math.max(...techsY);
		return [techs, columns, rows];
	}, []);
	
	return (
		<ScrollableGrid
			tag="main"
			name="research"
			class={classNames('page research')}
		>
			<div
				class="grid"
				style={{
					'--columns': columns,
					'--rows': rows,
				}}
			>
				<p class="about">
					Select your research progress so far, this tool will then only show recipes available to you.
					{state.research.value.length?
						<button class="reset" onClick={resetResearch}>Reset research</button> :
						<><br/><br/>With nothing selected, all recipes are available.</>
					}<br/>
					<br/>
					<label>
						Show matrix epoch: <input type="checkbox" checked={state.showMatrixEpoch.value} onClick={toggleShowEpoch}/>
					</label>
				</p>
				<Wires techs={techs} columns={columns} rows={rows}/>
				<Tiles techs={techs}/>
			</div>
		</ScrollableGrid>
	);
}
