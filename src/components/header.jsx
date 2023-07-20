import { NavLink, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import state from '../state';
import iconGithub from '../images/github-mark-white.svg';
import logo from '../images/logo.svg';

const RelativePaths = [
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
			document.documentElement.classList.add(`view-${b > a? 'right' : 'left'}`);
			navigate(newRoute);
		});
		transition.finished.then(() => {
			document.documentElement.classList.remove('view-left', 'view-right');
		});
	};
	
	return (
		<header class="app-header">
			<h1 class="title">
				<img class="logo" src={logo} alt=""/>
				DSP Production Ratio Calculator
			</h1>
			<div class="links">
				<NavLink className="link" to="/calculator" onClick={(event) => { event.preventDefault(); viewNavigate('/calculator') }}>Calculator</NavLink>
				<NavLink className={classNames('link', { 'has-research': state.research.value.length > 0 })} to="/research" onClick={(event) => { event.preventDefault(); viewNavigate('/research') }}>Research</NavLink>
				<NavLink className="link" to="/reference" onClick={(event) => { event.preventDefault(); viewNavigate('/reference') }}>Reference</NavLink>
				{/* <NavLink className="link" to="/settings">Settings</NavLink> */}
			</div>
			<a class="github" target="_blank" href="https://github.com/Martin-Pitt/dsp-prod-ratios">
				<img class="icon" src={iconGithub} alt=""/>
			</a>
		</header>
	);
}