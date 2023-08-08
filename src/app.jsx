import { useState, useEffect } from 'preact/hooks';
import { Router } from 'preact-router';
import {
	Meta, Tech, Recipes, Items, Strings,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	BeltTransportSpeed,
	Proliferator,
	RecipesUnlocked,
	ItemsUnlocked,
	StringFromTypes,
	locale, internalLocale,
} from './lib/data.js';
import state from './state.js';

import Header from './components/header.jsx';

import Intro from './pages/intro.jsx';
import Calculator from './pages/calculator.jsx';
import Research from './pages/research.jsx';
import Reference from './pages/reference.jsx';
import Settings from './pages/settings.jsx';


// Debugging & DevTools fun
console.log('Hey there! Want to play with the internal data? These are exposed on `window.…` for you to play with');
const Debuggables = {
	Meta,
	Tech,
	Recipes,
	Items,
	Strings,
	state,
	AssemblerProductionSpeed,
	SmelterProductionSpeed,
	ChemicalProductionSpeed,
	BeltTransportSpeed,
	Proliferator,
	RecipesUnlocked,
	ItemsUnlocked,
	StringFromTypes,
	locale,
	internalLocale,
};
Object.assign(window, Debuggables);
console.log(...Object.keys(Debuggables));
// for(let name in Debuggables) console.log(`window.${name}`, Debuggables[name]);



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