import { type GraphObjectChildren, evaluateGraph } from "../graph";
import type { Engine } from "../engine";

interface FragmentProps {
	children: GraphObjectChildren;
}

export function Fragment(props: FragmentProps, engine: Engine) {
	const { children } = props;
	if (Array.isArray(children)) {
		for (const child of children) {
			const innerTransform = engine.canvas().save();
			evaluateGraph(child, engine);
			engine.canvas().restoreToCount(innerTransform);
		}
		return null;
	}

	return children;
}
