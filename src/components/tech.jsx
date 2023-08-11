import { Techs, locale } from '../lib/data';


export default function Tech(props) {
	let { tech, id, named, name, ...other } = props;
	if(!tech) tech = Techs.find(tech => tech.id === id);
	
	if(props.name) return (
		<span class="tech named" lang={locale} {...other}>
			<span class="name">{tech.name}</span>
		</span>
	);
	
	if(props.named) return (
		<span class="tech named" lang={locale} {...other}>
			<span
				class="icon"
				data-icon={`tech.${tech.id}`}
			/> <span class="name">{tech.name}</span>
		</span>
	);
	
	return (
		<span
			class="tech icon"
			data-icon={`tech.${tech.id}`}
			title={tech.name}
			lang={locale}
			{...other}
		/>
	);
}