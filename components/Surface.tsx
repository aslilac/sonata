import { useCallback, useEffect, useRef, useState } from "react";
import { type GraphComponent, evaluateGraph } from "../renderer/graph";
import { Engine } from "../renderer/engine";
import { ReleasePool } from "../renderer/ReleasePool";
import * as styles from "./Surface.module.scss";

interface SurfaceProps {
	children: GraphComponent<{}>;
}

export function Surface(props: SurfaceProps) {
	const { children } = props;

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const engineRef = useRef<Engine | null>(null);
	const previousMousePositionRef = useRef<[number, number] | null>(null);
	const mousePositionRef = useRef<[number, number] | null>(null);

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const canvas = canvasRef.current;
		canvas.width = window.innerWidth * devicePixelRatio;
		canvas.height = window.innerHeight * devicePixelRatio;

		const pool = new ReleasePool();
		const engine = Engine.create(canvasRef.current!);
		engine.then((it) => {
			pool.alloc(it);
			engineRef.current = it;
		});

		return () => {
			pool.release();
		};
	}, []);

	useEffect(() => {
		if (!engineRef.current) {
			return;
		}

		const engine = engineRef.current;
		engine.clear();
		evaluateGraph(children, engine);
		engine.flush();
	});

	const onMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
		previousMousePositionRef.current = mousePositionRef.current;
		mousePositionRef.current = [event.clientX, event.clientY];
	}, []);

	const onMouseLeave = useCallback(() => {
		mousePositionRef.current = null;
	}, []);

	useEffect(() => {
		if (!engineRef.current) {
			return;
		}

		if (!mousePositionRef.current) {
			return;
		}

		const [x, y] = mousePositionRef.current;

		const engine = engineRef.current;

		const onHover = [...engine.events.onHover].reverse();
		for (const eventTarget of onHover) {
			if (eventTarget.contains(x, y)) {
				eventTarget.eventHandler();
				return;
			}
		}

		if (!previousMousePositionRef.current) {
			return;
		}

		const [oldX, oldY] = previousMousePositionRef.current;

		const onLeave = [...engine.events.onLeave].reverse();
		for (const eventTarget of onLeave) {
			if (eventTarget.contains(oldX, oldY) && !eventTarget.contains(x, y)) {
				eventTarget.eventHandler();
				return;
			}
		}
	});

	return (
		<canvas
			ref={canvasRef}
			className={styles["surface"]}
			onMouseMove={onMouseMove}
			onMouseLeave={onMouseLeave}
		></canvas>
	);
}
