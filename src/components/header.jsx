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
			
			<NavLink className="link" to="/dsp-prod-ratios/calculator">Calculator</NavLink>
			<NavLink className="link" to="/dsp-prod-ratios/research">Research</NavLink>
			<NavLink className="link" to="/dsp-prod-ratios/reference">Reference</NavLink>
			{/* <NavLink to="/dsp-prod-ratios/settings">Settings</NavLink> */}
			
			{props.children}
			
			<a class="github" target="_blank" href="https://github.com/Martin-Pitt/dsp-prod-ratios">
				<img class="icon" src={iconGithub} alt=""/>
			</a>
		</header>
	);
}