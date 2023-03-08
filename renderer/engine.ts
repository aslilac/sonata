import CanvasKitInit, { type CanvasKit, type Surface } from "canvaskit-wasm";
import canvasKitWasmLocation from "canvaskit-wasm/bin/canvaskit.wasm?url";

import { ReleasePool } from "./ReleasePool";

let canvasKitPromise: Promise<CanvasKit> | null = null;

export async function getCanvasKit(): Promise<CanvasKit> {
	if (canvasKitPromise === null) {
		canvasKitPromise = CanvasKitInit({
			locateFile: () => canvasKitWasmLocation,
		});
	}
	return canvasKitPromise;
}

type EventStorage = {
	[K in keyof Required<EventOptions>]: EventTarget[];
};

interface EventOptions {
	onClick?(): void;
	onHover?(): void;
	onLeave?(): void;
}

interface EventTarget {
	contains(x: number, y: number): boolean;
	eventHandler(): void;
}

export class Engine {
	static async create(canvas: HTMLCanvasElement) {
		const canvasKit = await getCanvasKit();
		return new Engine(canvas, canvasKit);
	}

	#pool: ReleasePool = new ReleasePool();
	#surface: Surface;
	events: EventStorage = {
		onClick: [],
		onHover: [],
		onLeave: [],
	};

	color: [number, number, number, number] = [0xa5, 0xe8, 0xda, 1];

	constructor(
		private readonly canvasElement: HTMLCanvasElement,
		public readonly canvasKit: CanvasKit,
	) {
		const surface = canvasKit.MakeWebGLCanvasSurface(canvasElement);
		if (!surface) {
			throw new Error("Failed to allocate surface");
		}
		this.#pool.alloc(surface);
		this.#surface = surface;
	}

	canvas() {
		return this.#surface.getCanvas();
	}

	clear() {
		// this.canvas().clear(this.canvasKit.Color4f(1, 1, 1, 1));
		this.canvas().clear(this.canvasKit.Color4f(0.05, 0.05, 0.05, 1));
		for (const event of Object.keys(this.events)) {
			this.events[event as keyof typeof this.events] = [];
		}
	}

	flush() {
		this.#surface.flush();
	}

	release() {
		this.#pool.release();
	}

	#normalizeContains(contains: (x: number, y: number) => boolean) {
		const transform = this.canvas().getLocalToDevice();

		// prettier-ignore
		const mouseToWorld = this.canvasKit.Matrix.invert([
			transform[0]!, transform[1]!, transform[3]!,
			transform[4]!, transform[5]!, transform[7]!,
			0,             0,             1,
		])!;

		return (x: number, y: number) =>
			contains(
				...(this.canvasKit.Matrix.mapPoints(mouseToWorld, [
					x * devicePixelRatio,
					y * devicePixelRatio,
				]) as [number, number]),
			);
	}

	attachEvents(contains: (x: number, y: number) => boolean, events: EventOptions) {
		for (const [event, eventHandler] of Object.entries(events)) {
			// Ignore cases like `{ onClick: undefined }`
			if (!eventHandler) {
				continue;
			}

			this.events[event as keyof EventOptions].push({
				contains: this.#normalizeContains(contains),
				eventHandler,
			});
		}
	}

	drawRect(
		originX: number,
		originY: number,
		width: number,
		height: number,
		events?: EventOptions,
	) {
		const canvas = this.#surface.getCanvas();
		ReleasePool.use((alloc) => {
			const paint = alloc(new this.canvasKit.Paint());
			paint.setColor(this.canvasKit.Color(...this.color));
			canvas.drawRect(
				this.canvasKit.XYWHRect(originX, originY, width, height),
				paint,
			);
		});

		if (events) {
			this.attachEvents(
				(x, y) =>
					x >= originX &&
					x <= originX + width &&
					y >= originY &&
					y <= originY + height,
				events,
			);
		}
	}

	drawCircle(centerX: number, centerY: number, radius: number, events?: EventOptions) {
		const canvas = this.#surface.getCanvas();
		ReleasePool.use((alloc) => {
			const paint = alloc(new this.canvasKit.Paint());
			paint.setColor(this.canvasKit.Color(...this.color));
			canvas.drawCircle(centerX, centerY, radius, paint);
		});

		if (events) {
			this.attachEvents(
				(x, y) => Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) <= radius,
				events,
			);
		}
	}
}
