import { useState, useEffect } from 'preact/hooks';
import { Router } from 'preact-router';
import {
	Meta, Techs, Recipes, Items, Locale,
	TechsByID, RecipesByID, ItemsByID, EpochsByTech,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	FractionationProductionSpeed,
	BeltTransportSpeed,
	Proliferator,
	RecipesUnlocked,
	ItemsUnlocked,
	StringFromTypes,
} from './lib/data.js';
import state from './state.js';
import { SolverTree, RecipeTree, CalcTree } from './lib/solver.js';


import Header from './components/header.jsx';

import Intro from './pages/intro.jsx';
import Calculator from './pages/calculator.jsx';
import Research from './pages/research.jsx';
import Reference from './pages/reference.jsx';
import Settings from './pages/settings.jsx';
import Tips from './pages/tips.jsx';
import Community from './pages/community.jsx';
import CSSVariables from './css/variables.js';


// Debugging & DevTools fun

// Super cool DSP ASCII logo by TheEagerCoder from: https://github.com/TheEagerCoder/dspcalc/blob/945770548ad51fe573bb45aca135b8a0913937e4/dspcalc_v0_1.py#L349-L378C67
console.log([
	"                                                   __          ",
	"                                                _,/ /          ",
	"                                              _/,_ /           ",
	"                     ____,-M\-----.___     _/’,/M /            ",
	"                 _,-!!!!!!!!M\        ‘-’’’ ,/M/,/             ",
	"              ,-’!!!!!!!!!!!|M|______     _/M/ /               ",
	"            ,/!\M\!!!!!!!!MMMMMMMMMM‘-./’M/  ‘._               ",
	"          ,/!!!!!\MM!!!’MMMMMMMMMMMMMMMMM,/      \             ",
	"         /!!!!!!!!!!‘MMMMMMMMMMMMMMMMMMM/         \            ",
	"        /!!!!!!!!!!!MMMMMMMMMMMMMMMMMM/’           ‘.          ",
	"       /!!!!!!!!!!!MMMMMMMMMMMMMMMMM/’              ‘.         ",
	"      /gggg!!!!!!!|MMMMMMMMMM/’   ‘’                 ‘:        ",
	"     ;!!!!!PPPPPPPMMMMMMMMMM|                         ‘}       ",
	"     |!!!!!!!!!!!!MMMMMMMMMMM\                         ]       ",
	"     |!!!!!!!!!!!!!MMMMMMMMMM/ ,,                      |       ",
	"     |!!!!!!!!!!!!,MMMMMMMMP/ /MM\                     |       ",
	"     {!!!!!!!!!’PPP MMMMMP/ /’MMMM\                    ]       ",
	"     {!!!!!’PPP       YM/ /’MMMMMMM\                  ;        ",
	"      :PPP’             ,/MMMMMMMMMM|                ;         ",
	"       \               /MMMMMMMMMMMM|               ;          ",
	"        \            /’MMMMMMMMMMMMM;              /           ",
	"         \         /’MMMMMMMMMMMMMM/              /            ",
	"          ‘.     /’MMMMMMMMMMMMMM/’             /’             ",
	"            ‘\  /MMMMMMMMMMMMMM/’            _/’               ",
	"            /’/M/’   \MMMMMM/             _,’                  ",
	"          ,//M/’ ,-.____             __,-’                     ",
	"         //M/’_/’       ‘-----------’                          ",
	"        /M__/’                                                 ",
	"       /,/                                                     "
].join('\n'));
console.log('Hey there! Want to play with the internal data? These are exposed on `window.…` for you to play with');
const Debuggables = {
	Meta, Techs, Recipes, Items, Locale,
	TechsByID, RecipesByID, ItemsByID, EpochsByTech,
	SolverTree, RecipeTree, CalcTree,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	FractionationProductionSpeed,
	BeltTransportSpeed,
	Proliferator,
	RecipesUnlocked,
	ItemsUnlocked,
	StringFromTypes,
	state,
	CSSVariables,
};
Object.assign(window, Debuggables);
console.log(...Object.keys(Debuggables));
// for(let name in Debuggables) console.log(`window.${name}`, Debuggables[name]);


if(window.plausible) plausible('pageview', {
	props: {
		// generation: new Date(Meta.generatedAt).toISOString().substring(0, 10),
		version: Meta.version,
		// buildAt: import.meta.env.BUILD_AT? new Date(import.meta.env.BUILD_AT).toISOString().substr(0, 16).replace('T', ' ') : 'dev'
		// commit: import.meta.env.BUILD_COMMIT,
		build: `${new Date(import.meta.env.BUILD_AT).toISOString().substring(0, 10)} ${import.meta.env.BUILD_COMMIT}`,
	},
});



function Page(props) {
	// if(document.startViewTransition)
	// {
	// 	let transition = document.startViewTransition(() => {
	// 		// let a = RelativePaths.findIndex(path => location.pathname.startsWith(path));
	// 		// let b = RelativePaths.indexOf(newRoute);
	// 		// let direction = a < b? 'right' : a > b? 'left' : 'same';
	// 		// document.documentElement.classList.add(`view-${direction}`);
	// 		// navigate(newRoute);
	// 	});
	// 	transition.finished.then(() => {
	// 		// document.documentElement.classList.remove('view-left', 'view-right');
	// 	});
		
	// }
	
	
	useEffect(() => document.title = props.title, [props.title]);
	
	useEffect(() => {
		// https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics#properly-inject-canonical-links
		let link = document.querySelector('link[rel="canonical"]');
		if(link) link.remove();
		
		link = document.createElement('link');
		link.setAttribute('rel', 'canonical');
		link.setAttribute('href', props.canonical);
		document.querySelector('title').insertAdjacentElement('afterend', link);
	}, [props.canonical]);
	
	useEffect(() => {
		let meta = document.head.querySelector('meta[name="description"]');
		if(meta) meta.remove();
		
		meta = document.createElement('meta');
		meta.setAttribute('name', 'description');
		meta.setAttribute('content', props.description);
		document.querySelector('title').insertAdjacentElement('afterend', meta);
	}, [props.description]);
	
	return props.element;
}


const RelativePaths = [
	'/',
	'/calculator',
	'/research',
	'/reference',
	'/community',
	'/tips',
];

function ViewTransitionPage(props) {
	const [oldProps, setProps] = useState(props);
	const [page, setPage] = useState(null);
	
	useEffect(() => {
		if(document.startViewTransition)
		{
			let transition = document.startViewTransition(() => {
				let a = RelativePaths.findIndex(path => oldProps.url === path);
				let b = RelativePaths.findIndex(path => props.url === path);
				let direction = a < b? 'right' : a > b? 'left' : 'same';
				document.documentElement.classList.add(`view-${direction}`);
				
				// console.log('[ViewTransitionPage]', a,b, oldProps.url, '=>', props.url);
				setPage(<Page {...props}/>);
			});
			
			transition.finished.then(() => {
				document.documentElement.classList.remove('view-left', 'view-right');
			});
		}
		else setPage(<Page {...props}/>);
		
		setProps(props);
	}, [props]);
	
	return page;
}





export function App(props) {
	return (
		<>
			<Header/>
				<Router>
					<ViewTransitionPage
						default
						element={<Intro/>}
						title="DSP Ratios"
						description="Plan and design production lines in Dyson Sphere Program with calculator, research and reference sheets"
						canonical="https://dsp-ratios.com"
					/>
					<ViewTransitionPage
						path="/calculator"
						element={<Calculator/>}
						title="Calculator | DSP Ratios"
						description="Calculator for planning production chains in Dyson Sphere Program"
						canonical="https://dsp-ratios.com/calculator"
					/>
					<ViewTransitionPage
						path="/research"
						element={<Research/>}
						title="Research | DSP Ratios"
						description="Research tree of Dyson Sphere Program, finetune the calculator to your current tech progress"
						canonical="https://dsp-ratios.com/research"
					/>
					<ViewTransitionPage
						path="/reference"
						element={<Reference/>}
						title="Reference Sheets | DSP Ratios"
						description="Quick reference sheets to Dyson Sphere Program such as items, recipes, buildings and technology"
						canonical="https://dsp-ratios.com/reference"
					/>
					<ViewTransitionPage
						path="/settings"
						element={<Settings/>}
						title="Settings | DSP Ratios"
						description="Settings for DSP Ratios"
						canonical="https://dsp-ratios.com/settings"
					/>
					<ViewTransitionPage
						path="/tips"
						element={<Tips/>}
						title="Tips | DSP Ratios"
						description="Tips for Dyson Sphere Program"
						canonical="https://dsp-ratios.com/tips"
					/>
					<ViewTransitionPage
						path="/community"
						element={<Community/>}
						title="Community | DSP Ratios"
						description="Community of Dyson Sphere Program"
						canonical="https://dsp-ratios.com/community"
					/>
				</Router>
		</>
	);
	
	
	useEffect(() => {
		let { pathname, search, hash } = location;
		if(!('sessionStorage' in window && 'localStorage' in window)) return;
		if(sessionStorage.visit) return;
		
		// This is the first session
		sessionStorage.visit = true;
		
		// Did we arrive on the default intro page?
		if(!(pathname === '/' && search === '' && hash === '')) return;
		
		// If we are a user already accustomed to the app, then swap to a useful page instead
		if(state.research.value.length)
		{
			// TODO: Either calculator or references, should find out which they seem to use most frequently?
			location.replace('/calculator');
		}
	}, []);
	
	return <RouterProvider router={router} />;
};










/*


function Root(props) {
	return (
		<>
			<Header/>
			<Outlet/>
		</>
	);
}

function Page(props) {
	useEffect(() => {
		document.title = props.title
	}, [props.title]);
	
	useEffect(() => {
		// https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics#properly-inject-canonical-links
		let link = document.querySelector('link[rel="canonical"]');
		if(link) link.remove();
		
		link = document.createElement('link');
		link.setAttribute('rel', 'canonical');
		link.setAttribute('href', props.canonical);
		document.querySelector('title').insertAdjacentElement('afterend', link);
	}, [props.canonical]);
	
	useEffect(() => {
		let meta = document.head.querySelector('meta[name="description"]');
		if(meta) meta.remove();
		
		meta = document.createElement('meta');
		meta.setAttribute('name', 'description');
		meta.setAttribute('content', props.description);
		document.querySelector('title').insertAdjacentElement('afterend', meta);
	}, [props.description]);
	
	return props.element;
}



// TODO: Overly complicated, perhaps simplify with preact-router https://github.com/preactjs/preact-router
const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Root/>}>
			<Route path="calculator" element={
				<Page
					title="Calculator | DSP Ratios"
					description="Calculator for planning production chains in Dyson Sphere Program"
					canonical="https://dsp-ratios.com/calculator"
					element={<Calculator/>}
				/>
			}/>
			<Route path="research" element={
				<Page
					title="Research | DSP Ratios"
					description="Research tree of Dyson Sphere Program, finetune the calculator to your current tech progress"
					canonical="https://dsp-ratios.com/research"
					element={<Research/>}
				/>
			}/>
			<Route path="reference" element={
				<Page
					title="Reference Sheets | DSP Ratios"
					description="Quick reference sheets to Dyson Sphere Program such as items, recipes, buildings and technology"
					canonical="https://dsp-ratios.com/reference"
					element={<Reference/>}
				/>
			}>
				<Route path="assemble" element={<ReferenceAssemble/>}/>
				<Route path="smelt" element={<ReferenceSmelt/>}/>
				<Route path="" loader={() => redirect('assemble')}/>
			</Route>
			<Route path="settings" element={
				<Page
					title="Settings | DSP Ratios"
					description="Settings for DSP Ratios"
					canonical="https://dsp-ratios.com/settings"
					element={<Settings/>}
				/>
			}/>
			<Route path="" element={
				<Page
					title="DSP Ratios"
					description="Plan and design production lines in Dyson Sphere Program with calculator, research and reference sheets"
					canonical="https://dsp-ratios.com"
					element={<Intro/>}
				/>
			}/>
		</Route>
	)
);


export function App(props) {
	useEffect(() => {
		let { pathname, search, hash } = location;
		if(!('sessionStorage' in window && 'localStorage' in window)) return;
		if(sessionStorage.visit) return;
		
		// This is the first session
		sessionStorage.visit = true;
		
		// Did we arrive on the default intro page?
		if(!(pathname === '/' && search === '' && hash === '')) return;
		
		// If we are a user already accustomed to the app, then swap to a useful page instead
		if(state.research.value.length)
		{
			// TODO: Either calculator or references, should find out which they seem to use most frequently?
			location.replace('/calculator');
		}
	}, []);
	
	return <RouterProvider router={router} />;
};


*/