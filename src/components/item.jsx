import { Items, locale } from '../lib/data';


export default function Item(props) {
	const item = props.item || Items.find(item => item.id === props.id);
	
	if(props.named) return (
		<span class="item" locale={locale}>
			<span class="icon" data-icon={`item.${item.id}`} data-count={props.count}/> <span class="name">{item.name}</span>
		</span>
	);
	
	else return (
		<span class="item icon" data-icon={`item.${item.id}`} data-count={props.count} title={item.name} locale={locale}/>
	);
}