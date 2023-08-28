import { useState, useEffect } from 'preact/hooks';
import { Link } from 'preact-router/match';
import classNames from 'classnames';
import state from '../state.js';
import iconGithub from '../images/github-mark-white.svg';
import logo from '../images/logo.svg';

function NavLink(props) {
	return <Link activeClassName="is-active" {...props}/>;
}


export default function Header(props) {
	const news = state.news.value;
	return (
		<header class="app-header">
			<div class="links">
				<NavLink class="link title-link" href="/" data-new={news?.item.isNew? 'NEWS' : null}>
					<h1 class="title">
						<img class="logo" src={logo} alt=""/>
						<span>DSP Ratios</span>
					</h1>
				</NavLink>
				<NavLink class="link" href="/calculator">Calculator</NavLink>
				<NavLink class={classNames('link', { 'has-research': state.research.value.length > 0 })} href="/research">Research</NavLink>
				<NavLink class="link" href="/reference" data-wip>Reference</NavLink>
			</div>
			<a class="github" rel="noreferrer" target="_blank" href="https://github.com/Martin-Pitt/dsp-prod-ratios">
				<img class="icon" src={iconGithub} alt=""/>
			</a>
		</header>
	);
}



/*

const RelativePaths = [
	'/',
	'/calculator',
	'/research',
	'/reference',
];

export default function Header(props) {
	const navigate = useNavigate();
	const viewNavigate = (newRoute) => {
		if(!document.startViewTransition) return navigate(newRoute);
		let transition = document.startViewTransition(() => {
			let a = RelativePaths.findIndex(path => location.pathname.startsWith(path));
			let b = RelativePaths.indexOf(newRoute);
			let direction = a < b? 'right' : a > b? 'left' : 'same';
			document.documentElement.classList.add(`view-${direction}`);
			navigate(newRoute);
		});
		transition.finished.then(() => {
			document.documentElement.classList.remove('view-left', 'view-right');
		});
	};
	
	return (
		<header class="app-header">
			<NavLink className="title-link" to="/" onClick={(event) => { event.preventDefault(); viewNavigate('/') }}>
				<h1 class="title">
					<img class="logo" src={logo} alt=""/>
					DSP Ratios
				</h1>
			</NavLink>
			<div class="links">
				<NavLink className="link" to="/calculator" onClick={(event) => { event.preventDefault(); viewNavigate('/calculator') }}>Calculator</NavLink>
				<NavLink className={classNames('link', { 'has-research': state.research.value.length > 0 })} to="/research" onClick={(event) => { event.preventDefault(); viewNavigate('/research') }}>Research</NavLink>
				<NavLink className="link" to="/reference" onClick={(event) => { event.preventDefault(); viewNavigate('/reference') }} data-wip>Reference</NavLink>
			</div>
			<a class="github" target="_blank" href="https://github.com/Martin-Pitt/dsp-prod-ratios">
				<img class="icon" src={iconGithub} alt=""/>
			</a>
		</header>
	);
}

*/