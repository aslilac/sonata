import { Circle } from "./components/Circle";
import { Fragment } from "./components/Fragment";
import { Rect } from "./components/Rect";
import { Transform } from "./components/Transform";
import type { Engine } from "./engine";

interface SceneProps {
	frame: number;
	on: boolean;
	setOn: (on: boolean) => void;
}

export function Scene(props: SceneProps, engine: Engine) {
	const { frame, on, setOn } = props;

	engine.color = on ? [0xa5, 0xe8, 0xda, 1] : [0xff, 0xaf, 0xfe, 1];

	return (
		<Fragment>
			<Transform scale={[4, 4]} position={{ x: 0, y: 0 }}>
				<Transform scale={[1, 2]} skew={[0, 0.2]} position={{ x: 50, y: 50 }}>
					<Rect x={0} y={0} width={100} height={100} />
				</Transform>
				<Circle
					x={300}
					y={100 + Math.sin(frame) * 50}
					radius={75}
					onLeave={() => setOn(false)}
				/>
				<Circle
					x={500}
					y={100 + Math.tan(frame) * 50}
					radius={75}
					onHover={() => setOn(true)}
				/>
			</Transform>
		</Fragment>
	);
}
