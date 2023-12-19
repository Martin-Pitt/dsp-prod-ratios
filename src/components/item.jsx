import { Items, Locale } from '../lib/data';


export default function Item(props) {
	let { item, id, named, name, count, per, proliferated, points, ...other } = props;
	if(!item) item = Items.find(item => item.id === id);
	if(proliferated && !points) points = state.proliferatorPoints.value;
	
	if(props.name) return (
		<span class="item named" lang={Locale.locale} {...other}>
			<span class="name">{item.name}{props.plural? 's' : '' /* TODO: Localisation support needed here */}</span>
		</span>
	);
	
	else if(props.named) return (
		<span class="item named" lang={Locale.locale} {...other}>
			<span
				class="icon"
				data-icon={`item.${item.id}`}
				data-count={count}
				data-per={per}
			>
				{proliferated && (
					<div
						class="icon proliferated"
						data-icon={`ui.inc-${proliferated? points : 0}`}
					/>
				)}
			</span> <span class="name">{item.name}{props.plural? 's' : '' /* TODO: Localisation support needed here */}</span>
		</span>
	);
	
	else return (
		<span
			class="item icon"
			data-icon={`item.${item.id}`}
			data-count={count} data-per={per}
			title={item.name}
			lang={Locale.locale}
			{...other}
		>
			{proliferated && (
				<div
					class="icon proliferated"
					data-icon={`ui.inc-${proliferated? points : 0}`}
				/>)}
		</span>
	);
}