import type { Engine } from "./engine";
import type { Key } from "react";

export type GraphObjectChildren = Array<GraphComponent<{}>> | GraphComponent<{}> | null;

export interface GraphObject<Props> {
	(props: Props, engine: Engine): GraphComponent<{}> | null;
}

export interface GraphComponent<Props> {
	type: GraphObject<Props>;
	props: Props;
	key: Key | null;
}

export function evaluateGraph<Props>(graph: GraphComponent<Props>, engine: Engine) {
	const transform = engine.canvas().save();
	const children = graph.type(graph.props, engine);
	if (children) {
		evaluateGraph(children, engine);
	}
	engine.canvas().restoreToCount(transform);
}
