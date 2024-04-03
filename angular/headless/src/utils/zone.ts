import {Injectable, NgZone, inject} from '@angular/core';
import {copyDirectiveExecutableInfo} from './directive';

const noop = () => {};
const identity = <T>(a: T) => a;

type Wrapper = <T>(fn: T) => T;

const createObjectWrapper =
	(wrap: Wrapper): Wrapper =>
	(object) => {
		if (!object || typeof object !== 'object') {
			return object;
		}
		const res = {} as any;
		for (const key of Object.keys(object)) {
			res[key] = wrap((object as any)[key]);
		}
		return res;
	};

const createDirectiveWrapper =
	(wrapReturnValue: Wrapper, wrapResult: Wrapper): Wrapper =>
	(fn) =>
		copyDirectiveExecutableInfo(fn, wrapResult(typeof fn === 'function' ? (((...args: any[]) => wrapReturnValue(fn(...args))) as any) : fn));

@Injectable({
	providedIn: 'root',
})
export class ZoneWrapper {
	readonly #zone = inject(NgZone);
	readonly #hasZone = this.#zone.run(() => NgZone.isInAngularZone()); // check if zone is enabled (can be NoopZone, cf https://angular.io/guide/zone#noopzone)
	#runNeeded = false;
	#runPlanned = false;

	planNgZoneRun = this.#hasZone
		? () => {
				if (this.#zone.isStable) {
					this.#runNeeded = true;
					if (!this.#runPlanned) {
						this.#runPlanned = true;
						void (async () => {
							await 0;
							this.#runPlanned = false;
							if (this.#runNeeded) {
								this.ngZoneRun(noop);
							}
						})();
					}
				}
			}
		: noop;

	/**
	 * Run the input function synchronously within the Angular zone
	 *
	 * @param fn - a function to run
	 * @returns the value returned by the function
	 */
	ngZoneRun<T>(fn: () => T): T {
		this.#runNeeded = false;
		return this.#zone.run(fn);
	}

	insideNgZone: Wrapper = this.#hasZone
		? (fn) => (typeof fn === 'function' ? (((...args: any[]) => this.ngZoneRun(() => fn(...args))) as any) : fn)
		: identity;
	insideNgZoneWrapFunctionsObject = this.#hasZone ? createObjectWrapper(this.insideNgZone) : identity;

	outsideNgZone: Wrapper = this.#hasZone
		? (fn) => (typeof fn === 'function' ? (((...args: any[]) => this.#zone.runOutsideAngular(() => fn(...args))) as any) : fn)
		: identity;

	outsideNgZoneWrapFunctionsObject = this.#hasZone ? createObjectWrapper(this.outsideNgZone) : identity;
	outsideNgZoneWrapDirective = this.#hasZone ? createDirectiveWrapper(this.outsideNgZoneWrapFunctionsObject, this.outsideNgZone) : identity;
	outsideNgZoneWrapDirectivesObject = this.#hasZone ? createObjectWrapper(this.outsideNgZoneWrapDirective) : identity;
}
