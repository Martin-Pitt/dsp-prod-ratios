import { NavLink } from 'react-router-dom';
import iconGithub from '../images/github-mark-white.svg';
import logo from '../images/logo.svg';

export default function Header(props) {
	return (
		<header class="app-header">
			<h1 class="title">
				<img class="logo" src={logo} alt=""/>
				DSP Production Ratio Calculator
			</h1>
			<div class="links">
				<NavLink className="link" to="/calculator">Calculator</NavLink>
				<NavLink className="link" to="/research">Research</NavLink>
				<NavLink className="link" to="/reference">Reference</NavLink>
				{/* <NavLink className="link" to="/settings">Settings</NavLink> */}
			</div>
			<a class="github" target="_blank" href="https://github.com/Martin-Pitt/dsp-prod-ratios">
				<img class="icon" src={iconGithub} alt=""/>
			</a>
		</header>
	);
}