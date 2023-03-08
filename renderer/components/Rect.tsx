import type { Engine } from "../engine";

interface RectProps {
	x: number;
	y: number;
	width: number;
	height: number;
}

export function Rect(props: RectProps, engine: Engine) {
	engine.drawRect(props.x, props.y, props.width, props.height);
	return null;
}
