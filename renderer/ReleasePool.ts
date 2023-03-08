type Releasable = Delete | Release;

interface Delete {
	delete(): void;
}

interface Release {
	release(): void;
}

export class ReleasePool {
	static use(func: (alloc: <T extends Releasable>(resource: T) => T) => void) {
		const pool = new ReleasePool();
		try {
			func((resource) => pool.alloc(resource));
		} finally {
			pool.release();
		}
	}

	#resources: Releasable[] = [];
	#released = false;

	alloc<T extends Releasable>(resource: T) {
		if (this.#released) {
			this.#releaseResource(resource);
		}

		this.#resources.push(resource);
		return resource;
	}

	release() {
		setTimeout(() => {
			this.#released = true;
			for (const resource of this.#resources) {
				this.#releaseResource(resource);
			}
		}, 0);
	}

	#releaseResource(resource: Releasable) {
		if ("delete" in resource) {
			resource.delete();
		}
		if ("release" in resource) {
			resource.release();
		}
	}
}
