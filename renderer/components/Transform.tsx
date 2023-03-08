import type { Engine } from "../engine";
import { GraphObjectChildren } from "../graph";
import { Fragment } from "./Fragment";

interface TransformProps {
	scale: [x: number, y: number];
	skew?: [number, number];
	position: { x: number; y: number };
	children: GraphObjectChildren;
}

export function Transform(props: TransformProps, engine: Engine) {
	const { children, position, scale, skew = [0, 0] } = props;

	// prettier-ignore
	const matrix = [
		scale[0], skew[0],  position.x,
		skew[1],  scale[1], position.y,
	];
	engine.canvas().concat(matrix);

	return <Fragment>{children}</Fragment>;
}
