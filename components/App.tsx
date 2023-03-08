import { useCallback, useEffect, useState } from "react";
import { Surface } from "./Surface";
import { Scene } from "../renderer/Scene";

export function App() {
	const [start] = useState(() => Date.now());
	const [frame, setFrame] = useState(0);
	const [on, setOn] = useState(false);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			let key = event.key.toLowerCase();
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	useEffect(() => {
		let enabled = true;

		const renderLoop = () => {
			if (!enabled) return;
			setFrame((Date.now() - start) / 1000);
			requestAnimationFrame(renderLoop);
		};

		requestAnimationFrame(renderLoop);
		return () => {
			enabled = false;
		};
	}, []);

	const onDoubleClick = useCallback(() => {
		if (!document.fullscreenElement) {
			document.body.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}, []);

	return (
		<div onDoubleClick={onDoubleClick}>
			<Surface>
				<Scene frame={frame} on={on} setOn={setOn} />
			</Surface>
		</div>
	);
}
