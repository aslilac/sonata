import type { Engine } from "../engine";

interface CircleProps {
	x: number;
	y: number;
	radius: number;
	onHover?: () => void;
	onLeave?: () => void;
}

export function Circle(props: CircleProps, engine: Engine) {
	const { onHover, onLeave } = props;
	engine.drawCircle(props.x, props.y, props.radius, { onHover, onLeave });
	return null;
}
