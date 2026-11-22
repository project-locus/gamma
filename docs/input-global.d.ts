/// <reference path="./font.d.ts" />
/// <reference path="./gamma-global.d.ts" />
export {}
declare global{
	/**
	 * A growable set of non-negative integers, stored as an array of 32-bit integers where each bit represents whether a number is in the set. Bit `n` lives in element `n >>> 5`, at bit `n & 31`
	 *
	 * The array is kept trimmed: trailing elements that are 0 are removed by any method that unsets bits (an empty set has a `length` of 0)
	 *
	 * Ranges (`from`, `to`) are always inclusive of `from` and exclusive of `to`
	 *
	 * `BitField` is defined directly on `globalThis` (and only if it isn't already defined), not on the Gamma instance
	 */
	class BitField extends Array<number>{
		/**
		 * Construct a BitField
		 * @param n Initial contents, either
		 * - An array of 32-bit integers, which are copied as-is (i.e the raw backing representation, NOT a list of numbers to put in the set)
		 * - A `Uint8Array`, the raw backing representation in little-endian byte order (see `BitField.toUint8Array()`)
		 * - Any other iterable of numbers to put in the set
		 */
		constructor(n?: number[] | Uint8Array | Iterable<number>)
		/** Turn an array of 32-bit integers (e.g as parsed from JSON) into a `BitField` in-place, by changing its prototype. If the value is not an array, a new, empty `BitField` is returned instead */
		static parse(a: any): BitField
		/** Decode a BitField from a buffer. See npm:nanobuf
		 * @param b An existing BitField to decode into, which is cleared first. If not specified, a new BitField is created
		 * @returns The decoded BitField (`b`, if specified)
		 */
		static decode(buf: any, b?: BitField): BitField
		/** Encode a BitField to a buffer. See npm:nanobuf */
		static encode(buf: any, b: BitField): void
		/** Construct a `BitField` containing the given numbers */
		static of(...n: number[]): BitField

		/** Add a number to the set */
		set(pos: number): void
		/** Remove a number from the set */
		unset(pos: number): void
		/** Add all numbers in the range [`from`, `to`) to the set */
		setRange(from: number, to: number): void
		/** Remove all numbers in the range [`from`, `to`) from the set. If `to` is not specified, every number from `from` onwards is removed */
		unsetRange(from: number, to?: number): void
		/** Whether any number in the range [`from`, `to`) is in the set. If `to` is not specified, checks every number from `from` onwards */
		anyIn(from?: number, to?: number): boolean
		/** Whether every number in the range [`from`, `to`) is in the set */
		allIn(from: number, to: number): boolean
		/** Add the number to the set if it is not present, or remove it if it is */
		toggle(pos: number): void
		/** Whether a number is in the set */
		has(pos: number): boolean
		/** Remove a number from the set, returning whether it was present beforehand (i.e whether this call changed anything) */
		pop(pos: number): boolean
		/** Add a number to the set, returning whether it was absent beforehand (i.e whether this call changed anything) */
		put(pos: number): boolean
		/** Set `this` to the symmetric difference of `this` and `other`, modifying `this` */
		xor(other: BitField): void
		/** Set `this` to the intersection of `this` and `other`, modifying `this` */
		and(other: BitField): void
		/** Set `this` to the union of `this` and `other`, modifying `this` */
		or(other: BitField): void
		/** Returns the smallest non-negative number not in the set */
		firstUnset(): number
		/** Returns the smallest number in the set, or -1 if the set is empty */
		firstSet(): number
		/** Returns the largest number in the set, or -1 if the set is empty */
		lastSet(): number
		/** Remove and return the smallest number in the set, or -1 if the set is empty */
		popFirst(): number
		/** Add and return the smallest non-negative number not in the set. Useful for allocating IDs */
		putFirst(): number
		/** Remove and return the largest number in the set, or -1 if the set is empty */
		popLast(): number
		/** Remove all numbers from the set */
		clear(): void
		/** Iterate over all numbers in the set, in ascending order */
		[Symbol.iterator](): IterableIterator<number>
		/**
		 * Call `cb` for every number in the set, in ascending order
		 * @param from Only numbers greater than or equal to this value are iterated. Default: 0
		 * @performance Faster than iterating with `for...of`
		 */
		iter(cb: (n: number) => any, from?: number): void
		/** Returns the raw backing representation as bytes, in little-endian order, with trailing zero bytes trimmed. Can be passed back to the constructor */
		toUint8Array(): Uint8Array
	}

	/**
	 * Mouse button IDs. These are the key IDs used by an `InputContext` (e.g `ictx.has(MOUSE.LEFT)`, `ictx.onKey(MOUSE.RIGHT, ...)`), as well as the bit indices of `PointerState.buttons` (e.g `ptr.has(MOUSE.RIGHT)`)
	 *
	 * Key IDs 0-7 are reserved for mouse buttons; keyboard keys start at 8 (see `KEY`)
	 */
	namespace MOUSE{
		const LEFT = 0
		const RIGHT = 1
		const MIDDLE = 2
		const BACK = 3
		const FORWARD = 4
		/** The eraser end of a pen, or a pen's eraser button. Mainly useful with `PointerState.buttons` (e.g `ptr.has(MOUSE.ERASER)`), as mice do not have this button */
		const ERASER = 5
	}

	/**
	 * Keyboard key IDs. These are the key IDs used by an `InputContext` (e.g `ictx.has(KEY.W)`, `ictx.onKey(KEY.SPACE, ...)`)
	 *
	 * These are based on the legacy `KeyboardEvent.keyCode` values, normalized across browsers. They are physical keys: `KEY.A` refers to the key in the position of A on a QWERTY keyboard, irrespective of the user's keyboard layout.
	 */
	namespace KEY{
		const A = 65, B = 66, C = 67, D = 68, E = 69, F = 70, G = 71, H = 72, I = 73, J = 74, K = 75, L = 76, M = 77
		const N = 78, O = 79, P = 80, Q = 81, R = 82, S = 83, T = 84, U = 85, V = 86, W = 87, X = 88, Y = 89, Z = 90
		/** Digit keys on the main keyboard row. See `NUMPAD_0`...`NUMPAD_9` for numpad digits */
		const NUM_0 = 48, NUM_1 = 49, NUM_2 = 50, NUM_3 = 51, NUM_4 = 52, NUM_5 = 53, NUM_6 = 54, NUM_7 = 55, NUM_8 = 56, NUM_9 = 57
		const F1 = 112, F2 = 113, F3 = 114, F4 = 115, F5 = 116, F6 = 117, F7 = 118, F8 = 119, F9 = 120, F10 = 121, F11 = 122, F12 = 123
		const SPACE = 32
		/** The backtick/tilde key (`` ` ``) */
		const BACKTICK = 192
		const TAB = 9
		/** Backspace */
		const BACK = 8
		const ENTER = 13
		const SHIFT = 16
		const CTRL = 17
		const ALT = 18
		const ESC = 27
		/** The Windows key / Command key. Left and right meta keys are both reported as this key */
		const META = 91
		const METARIGHT = 93
		const CAPSLOCK = 20
		const UP = 38, RIGHT = 39, DOWN = 40, LEFT = 37
		/**
		 * The platform's primary modifier key: `KEY.META` (Command) on Mac, `KEY.CTRL` everywhere else
		 * @example
		 * ```js
		 * // Ctrl+Z, or Cmd+Z on Mac
		 * ictx.onKeyPress(KEY.Z, () => { if(ictx.has(KEY.MOD)) undo() })
		 * ```
		 */
		const MOD: 91 | 17
		const MINUS = 189
		const EQUAL = 187
		/** `[` */
		const BR_LEFT = 219
		/** `]` */
		const BR_RIGHT = 221
		const SEMICOLON = 186
		/** Apostrophe / quote key (`'`) */
		const APOS = 222
		const BACKSLASH = 220
		const COMMA = 188
		const DOT = 190
		const SLASH = 191
		const PAUSE = 19
		const PAD_ENTER = 12
		const CLEAR = 10
		const HOME = 36
		const END = 35
		const PAGE_UP = 33
		const PAGE_DOWN = 34
		const INS = 45
		const DEL = 46
		/** The context menu key. Same value as `KEY.METARIGHT` */
		const CTX_MENU = 93
		/** Numpad digit keys. See `NUM_0`...`NUM_9` for digits on the main keyboard row */
		const NUMPAD_0 = 96, NUMPAD_1 = 97, NUMPAD_2 = 98, NUMPAD_3 = 99, NUMPAD_4 = 100, NUMPAD_5 = 101, NUMPAD_6 = 102, NUMPAD_7 = 103, NUMPAD_8 = 104, NUMPAD_9 = 105
		/** Numpad `/` */
		const PAD_DIV = 111
		/** Numpad `*` */
		const PAD_MULT = 106
		/** Numpad `-` */
		const PAD_SUB = 109
		/** Numpad `+` */
		const PAD_ADD = 107
		/** Numpad `.` (or `,` on some layouts) */
		const PAD_DOT = 110
		const NUM_LOCK = 144
		const SCROLL_LOCK = 145
		const HELP = 26
		/** The `ろ` key found on Japanese keyboards */
		const RO = 193
		/** The `¥` key found on Japanese keyboards */
		const YEN = 255
		/** Same as `KEY.PRINT_SCREEN` */
		const SYSRQ = 44
		const PRINT_SCREEN = 44
	}

	/**
	 * Gamepad button and stick IDs, following the [W3C standard gamepad layout](https://w3c.github.io/gamepad/#remapping). Button names follow the Xbox convention (e.g `A` is the bottom face button, which is ✕ on a PlayStation controller)
	 *
	 * Buttons are used with `GamepadState.has()`, `InputContext.onGamepadButton()`, etc... Sticks are used with `GamepadState.axis()` and `InputContext.onGamepadAxis()`
	 */
	namespace GAMEPAD{
		/** Bottom face button */ const A = 0
		/** Right face button */ const B = 1
		/** Left face button */ const X = 2
		/** Top face button */ const Y = 3
		/** Left bumper */ const LB = 4
		/** Right bumper */ const RB = 5
		/** Left trigger. Only reported as pressed/unpressed; analog trigger values are not available */ const LT = 6
		/** Right trigger. Only reported as pressed/unpressed; analog trigger values are not available */ const RT = 7
		/** Back/view/share button */ const SELECT = 8
		/** Start/menu/options button */ const START = 9
		/** D-pad up */ const UP = 12
		/** D-pad down */ const DOWN = 13
		/** D-pad left */ const LEFT = 14
		/** D-pad right */ const RIGHT = 15
		/** Home/guide button */ const MENU = 16
		/** Left stick. This is an axis ID, not a button ID (see `GamepadState.axis()`) */ const LEFT_STICK = 0
		/** Right stick. This is an axis ID, not a button ID (see `GamepadState.axis()`) */ const RIGHT_STICK = 1
	}

	/**
	 * The state of a single pointer (mouse, finger, pen, ...)
	 *
	 * Pointer states are copied when they are put into an `InputContext` (see `InputContext.setPointer()`), so the object you pass in is never stored. The object stored in a context is updated in-place as the pointer changes, so a reference to it (e.g `ictx.cursor`) stays up-to-date for as long as the pointer exists
	 */
	class PointerState{
		/**
		 * Construct a new pointer state, optionally copying all values from another
		 */
		constructor(other?: PointerState | null)
		/** Copy all values from another pointer state into this one */
		update(other: PointerState): void

		/**
		 * Normalized x position. For pointers on the main context, this is in the range [0,1] from the left edge to the right edge of the canvas
		 *
		 * To convert to a position in a drawable's coordinate space, use `Drawable2D.unproject()`
		 */
		x: number
		/**
		 * Normalized y position. For pointers on the main context, this is in the range [0,1] from the **bottom** edge to the **top** edge of the canvas (i.e y points up, matching Gamma's coordinate system)
		 *
		 * To convert to a position in a drawable's coordinate space, use `Drawable2D.unproject()`
		 */
		y: number
		/** Pen tilt along the x axis, in radians. 0 for pointers that do not support tilt */
		tiltX: number
		/** Pen tilt along the y axis, in radians. 0 for pointers that do not support tilt */
		tiltY: number
		/** Pen rotation around its own axis, in radians. 0 for pointers that do not support twist */
		twist: number
		/** Pressure, in the range [0,1]. For pointers that do not support pressure, this is 0.5 while pressed and 0 otherwise */
		pressure: number
		/**
		 * Bitmask of buttons currently pressed, as given by DOM `PointerEvent.buttons`. Bit indices match `MOUSE`
		 * - bit 0 (1): Primary button (`MOUSE.LEFT`, or a finger/pen touching the surface)
		 * - bit 1 (2): Secondary button (`MOUSE.RIGHT`, pen barrel button)
		 * - bit 2 (4): Auxiliary button (`MOUSE.MIDDLE`)
		 * - bit 3 (8): Back button (`MOUSE.BACK`)
		 * - bit 4 (16): Forward button (`MOUSE.FORWARD`)
		 * - bit 5 (32): Pen eraser (`MOUSE.ERASER`)
		 *
		 * The methods `has()`, `anyIn()`, `firstSet()`, `iter()`, etc... work on this bitmask just like they would for a `BitField`
		 */
		buttons: number
		/** Shorthand for `has(0)`: whether the primary button is pressed (or, for touch/pen input, whether the pointer is touching the surface) */
		readonly pressed: boolean
		/**
		 * Set a hint for how this pointer should be displayed. For the mouse, this sets the cursor. `null` if this pointer cannot display hints (e.g touch input)
		 * @param hint One of the cursor constants on `PointerState` (e.g `PointerState.POINTER`, `PointerState.HIDDEN`), or a URL to an image to use as a custom cursor
		 *
		 * The hint is applied at the end of the frame (on `flush()`), so it is fine to call this many times per frame
		 * @example
		 * ```js
		 * ictx.onPointerUpdate((id, ptr) => {
		 * 	ptr?.setHint?.(isHoveringButton(ptr) ? PointerState.POINTER : PointerState.DEFAULT)
		 * })
		 * ```
		 */
		setHint: ((hint: number | string) => void) | null
		/**
		 * Vibrate the device this pointer belongs to, using the same pattern format as [`navigator.vibrate()`](https://developer.mozilla.org/docs/Web/API/Navigator/vibrate). `null` if vibration is not supported
		 */
		vibrate: ((pattern: number | number[]) => void) | null

		/** Whether the button at bit `btn` is pressed. See `PointerState.buttons` */
		has(btn: number): boolean
		/** Whether any button with bit in the range [`from`, `to`) is pressed. If `to` is not specified, checks every bit from `from` onwards */
		anyIn(from?: number, to?: number): boolean
		/** Whether every button with bit in the range [`from`, `to`) is pressed */
		allIn(from: number, to: number): boolean
		/** Returns the lowest button bit that is not pressed */
		firstUnset(): number
		/** Returns the lowest button bit that is pressed, or -1 if no buttons are pressed */
		firstSet(): number
		/** Returns the highest button bit that is pressed, or -1 if no buttons are pressed */
		lastSet(): number
		/** Iterate over all pressed button bits, in ascending order */
		[Symbol.iterator](): IterableIterator<number>
		/** Call `cb` for every pressed button bit greater than or equal to `from`, in ascending order */
		iter(cb: (btn: number) => any, from?: number): void

		/** Pointer hint: the default cursor. See `PointerState.setHint()` */ static readonly DEFAULT = 0
		/** Pointer hint: no cursor. See `PointerState.setHint()` */ static readonly HIDDEN = 1
		/** Pointer hint: CSS cursor `context-menu`. See `PointerState.setHint()` */ static readonly CONTEXT_MENU = 2
		/** Pointer hint: CSS cursor `help`. See `PointerState.setHint()` */ static readonly HELP = 3
		/** Pointer hint: CSS cursor `pointer`, conventionally used for clickable elements. See `PointerState.setHint()` */ static readonly POINTER = 4
		/** Pointer hint: CSS cursor `progress`. See `PointerState.setHint()` */ static readonly PROGRESS = 5
		/** Pointer hint: CSS cursor `wait`. See `PointerState.setHint()` */ static readonly WAIT = 6
		/** Pointer hint: CSS cursor `cell`. See `PointerState.setHint()` */ static readonly CELL = 7
		/** Pointer hint: CSS cursor `crosshair`. See `PointerState.setHint()` */ static readonly CROSSHAIR = 8
		/** Pointer hint: CSS cursor `text`, conventionally used for selectable/editable text. See `PointerState.setHint()` */ static readonly TEXT = 9
		/** Pointer hint: CSS cursor `vertical-text`. See `PointerState.setHint()` */ static readonly VERTICAL_TEXT = 10
		/** Pointer hint: CSS cursor `alias`. See `PointerState.setHint()` */ static readonly ALIAS = 11
		/** Pointer hint: CSS cursor `copy`. See `PointerState.setHint()` */ static readonly COPY = 12
		/** Pointer hint: CSS cursor `move`. See `PointerState.setHint()` */ static readonly MOVE = 13
		/** Pointer hint: CSS cursor `no-drop`. See `PointerState.setHint()` */ static readonly NO_DROP = 14
		/** Pointer hint: CSS cursor `not-allowed`. See `PointerState.setHint()` */ static readonly NOT_ALLOWED = 15
		/** Pointer hint: CSS cursor `grab`. See `PointerState.setHint()` */ static readonly GRAB = 16
		/** Pointer hint: CSS cursor `grabbing`. See `PointerState.setHint()` */ static readonly GRABBING = 17
		/** Pointer hint: CSS cursor `e-resize`. See `PointerState.setHint()` */ static readonly E_RESIZE = 18
		/** Pointer hint: CSS cursor `n-resize`. See `PointerState.setHint()` */ static readonly N_RESIZE = 19
		/** Pointer hint: CSS cursor `ne-resize`. See `PointerState.setHint()` */ static readonly NE_RESIZE = 20
		/** Pointer hint: CSS cursor `nw-resize`. See `PointerState.setHint()` */ static readonly NW_RESIZE = 21
		/** Pointer hint: CSS cursor `s-resize`. See `PointerState.setHint()` */ static readonly S_RESIZE = 22
		/** Pointer hint: CSS cursor `se-resize`. See `PointerState.setHint()` */ static readonly SE_RESIZE = 23
		/** Pointer hint: CSS cursor `sw-resize`. See `PointerState.setHint()` */ static readonly SW_RESIZE = 24
		/** Pointer hint: CSS cursor `w-resize`. See `PointerState.setHint()` */ static readonly W_RESIZE = 25
		/** Pointer hint: CSS cursor `ew-resize`. See `PointerState.setHint()` */ static readonly EW_RESIZE = 26
		/** Pointer hint: CSS cursor `ns-resize`. See `PointerState.setHint()` */ static readonly NS_RESIZE = 27
		/** Pointer hint: CSS cursor `nesw-resize`. See `PointerState.setHint()` */ static readonly NESW_RESIZE = 28
		/** Pointer hint: CSS cursor `nwse-resize`. See `PointerState.setHint()` */ static readonly NWSE_RESIZE = 29
		/** Pointer hint: CSS cursor `col-resize`. See `PointerState.setHint()` */ static readonly COL_RESIZE = 30
		/** Pointer hint: CSS cursor `row-resize`. See `PointerState.setHint()` */ static readonly ROW_RESIZE = 31
		/** Pointer hint: CSS cursor `all-scroll`. See `PointerState.setHint()` */ static readonly ALL_SCROLL = 32
		/** Pointer hint: CSS cursor `zoom-in`. See `PointerState.setHint()` */ static readonly ZOOM_IN = 33
		/** Pointer hint: CSS cursor `zoom-out`. See `PointerState.setHint()` */ static readonly ZOOM_OUT = 34
	}

	/**
	 * The state of a single gamepad. As a `BitField`, it holds the set of buttons currently pressed (see `GAMEPAD`), e.g `gamepad.has(GAMEPAD.A)`
	 *
	 * Gamepad states are copied when they are put into an `InputContext` (see `InputContext.setGamepad()`), so the object you pass in is never stored. The object stored in a context is updated in-place as the gamepad changes, so a reference to it (e.g `ictx.primaryGamepad`) stays up-to-date for as long as the gamepad is connected
	 */
	class GamepadState extends BitField{
		/**
		 * Construct a new gamepad state, optionally copying all buttons, axes and the `vibrate` function from another
		 */
		constructor(other?: GamepadState | null)
		/** Copy all buttons, axes and the `vibrate` function from another gamepad state into this one, firing button/axis listeners of any subscribed `InputContext` for anything that changed */
		update(other: GamepadState): void
		/**
		 * Get the position of a stick (see `GAMEPAD.LEFT_STICK`, `GAMEPAD.RIGHT_STICK`), or null if this gamepad doesn't have that stick
		 *
		 * Each component is in the range [-1,1]. For gamepads with a standard mapping, positive y is up
		 *
		 * The returned object is updated in-place as the stick moves. No deadzone is applied, so a stick at rest may report small non-zero values
		 */
		axis(i: number): vec2 | null
		/**
		 * Vibrate the gamepad, or `null` if this gamepad does not support vibration. Each magnitude is in the range [0,1]. Default: 1
		 *
		 * Most browsers do not support separate left/right motors, in which case the left and right magnitudes are averaged
		 * @param duration Duration of the vibration, in seconds. Default: 1
		 */
		vibrate: ((leftWeak?: number, leftStrong?: number, rightWeak?: number, rightStrong?: number, duration?: number) => void) | null
	}

	/**
	 * An input context holds input state, and offers interfaces for listening to, modifying and propagating input events. It combines:
	 * - Logical keys (as a `BitField`, e.g `ictx.has(KEY.W)`). Key IDs 0-7 are mouse buttons (see `MOUSE`), 8+ are keyboard keys (see `KEY`)
	 * - Accumulated mouse movement and wheel deltas (`.mouse`, `.wheel`)
	 * - Pointers (`.pointer(id)`). ID 0 is the main mouse pointer (also accessible via `.cursor`), 1+ are other pointers such as fingers or pens
	 * - Gamepads (`.gamepad(id)`). The oldest connected gamepad is also accessible via `.primaryGamepad`
	 * - Device orientation and motion (`.orientation`, `.transientVelocity`)
	 *
	 * The main context, `ictx`, is fed directly from DOM events. New contexts can be created with `InputContext()` and are fed by you
	 *
	 * ### Events and propagation
	 * An input context acts like a filter. When an event is fired (e.g via `setKey()`), the context's state is updated immediately, then its listeners are called, **most recently added first**. Listeners can modify the event (e.g cancel a key press by returning `false`) and the modified event is passed on to the next listener, then to the next context in the chain (see `InputContext.next`), and so on.
	 *
	 * Chaining contexts is useful for handling many layers of input processing, e.g global shortcuts, per-scene inputs, etc... as well as keeping track of intermediate input states that may be needed later in a render/update loop. Alternatively, a listener can forward events to any other context(s) with `setKey()`, `setPointer()`, etc..., which offers more control over propagation
	 *
	 * Events are only fired when the state actually changes (e.g a key that is already down being set down again is ignored), unless refired explicitly (see `refireKey()`, `refirePointer()`, ...)
	 *
	 * Errors thrown inside listeners are reported (as unhandled promise rejections) but do not stop other listeners or propagation
	 *
	 * Note that mouse button/movement events and pointer 0 events are derived separately. While they will typically match, there is no intrinsic reason they must (e.g a pointer could be synthesized from touch input, a context may wish to remap mouse buttons before propagating, ...)
	 * @example
	 * ```js
	 * // Every frame, check the state of inputs
	 * loop(() => {
	 * 	const dx = ictx.has(KEY.D) - ictx.has(KEY.A)
	 * 	const {x, y} = ctx.unproject(ictx.cursor ?? vec2(.5))
	 * 	// ...
	 * 	ictx.clearDeltas()
	 * })
	 * // Or listen for specific events
	 * ictx.onKeyPress(KEY.SPACE, () => jump())
	 * ```
	 */
	interface InputContext extends BitField{
		/** The next context in the chain. Any event fired on this context is propagated to the next context after this context's listeners have run (and possibly modified it). Default: `null` */
		next: InputContext | null
		/** Accumulated mouse wheel delta. Not reset automatically; see `InputContext.clearDeltas()` */
		wheel: vec2
		/** Accumulated mouse movement delta, in pixels, with positive y pointing up. Not reset automatically; see `InputContext.clearDeltas()` */
		mouse: vec2
		/** The main mouse pointer, which is always equal to `.pointer(0)`, or null if the mouse is not over this context. See `PointerState` */
		cursor: PointerState | null
		/** The oldest pointer on this context, or null if there are no pointers on this context. Useful for supporting both mouse and touch input with no extra effort */
		firstPointer: PointerState | null
		/** The primary gamepad, which is the oldest gamepad connected on this context, or null if there are no gamepads connected on this context. `onGamepadButton()`/`onGamepadAxis()` listeners only receive events from this gamepad */
		primaryGamepad: GamepadState | null

		/** Get a pointer by its ID, or null if there is no such pointer on this context */
		pointer(id: number): PointerState | null
		/** Call `cb` for every pointer on this context */
		iterPointers(cb: (id: number, pointer: PointerState) => any): void
		/** Get a gamepad by its ID, or null if there is no such gamepad on this context. See `InputContext.setGamepad()` for how IDs are assigned */
		gamepad(id: number): GamepadState | null
		/** Call `cb` for every gamepad on this context */
		iterGamepads(cb: (id: number, gamepad: GamepadState) => any): void

		/** Remove all listeners on this context. Input state is kept */
		reset(): void
		/** Remove all listeners and clear all input state (keys, pointers, gamepads, deltas) on this context, without firing any events */
		clear(): void
		/** Reset the accumulated deltas `.mouse` and `.wheel` to 0. Typically called at the end of every frame */
		clearDeltas(): void

		/**
		 * Listen for any key update. The listener is called for every key that changes on this context.
		 *
		 * Return a boolean to override `isDown` for subsequent listeners and contexts.
		 *
		 * If another `InputContext` is passed, key events are forwarded to it (equivalent to `ictx.onKeyUpdate((key, isDown) => other.setKey(key, isDown))`)
		 */
		onKeyUpdate(fn: ((key: number, isDown: boolean, ictx: InputContext) => boolean | void) | InputContext): void
		/**
		 * Listen for updates to a specific key (or array of keys)
		 *
		 * Return a boolean to override `isDown` for subsequent listeners and contexts.
		 *
		 * Specific key listeners are called before generic `onKeyUpdate()` listeners
		 * @example
		 * ```js
		 * ictx.onKey([KEY.LEFT, KEY.A], (isDown, key) => {
		 * 	console.log(isDown ? 'pressed' : 'released', key)
		 * 	return false // Hide this key from contexts further down the chain
		 * })
		 * ```
		 */
		onKey(key: number | number[], fn: (isDown: boolean, key: number, ictx: InputContext) => boolean | void): void
		/**
		 * Listen for presses of a specific key (or array of keys). The listener is called only when the key goes from up to down (or down to up if `onRelease` is true)
		 *
		 * The event is consumed: subsequent listeners and contexts always see the key as up (or down if `onRelease` is true)
		 * @param onRelease Call the listener when the key is released instead of when it is pressed. Default: `false`
		 */
		onKeyPress(key: number | number[], fn: (key: number) => any, onRelease?: boolean): void
		/**
		 * Listen for updates to a specific button (or array of buttons) on the primary gamepad. See `GAMEPAD` and `InputContext.primaryGamepad`
		 *
		 * Return a boolean to override `isDown` for subsequent listeners. Gamepad button events are not propagated to other contexts.
		 *
		 * When the primary gamepad changes, listeners are called for every button pressed on the old gamepad (released) and on the new gamepad (pressed)
		 */
		onGamepadButton(btn: number | number[], fn: (isDown: boolean, btn: number, ictx: InputContext) => boolean | void): void
		/**
		 * Listen for presses of a specific button (or array of buttons) on the primary gamepad. See `InputContext.onKeyPress()`
		 * @param onRelease Call the listener when the button is released instead of when it is pressed. Default: `false`
		 */
		onGamepadButtonPress(btn: number | number[], fn: (btn: number) => any, onRelease?: boolean): void
		/**
		 * Listen for movement of a specific stick (or array of sticks) on the primary gamepad. See `GAMEPAD.LEFT_STICK`, `GAMEPAD.RIGHT_STICK` and `GamepadState.axis()`
		 *
		 * Return a vec2 to override the position for subsequent listeners, or `null` to override it with (0, 0). Gamepad axis events are not propagated to other contexts.
		 */
		onGamepadAxis(axis: number | number[], fn: (x: number, y: number, ictx: InputContext) => vec2 | null | void): void
		/**
		 * Listen for any pointer update (new pointer, removed pointer, or a change in an existing pointer). `pointer` is `null` if the pointer was removed.
		 *
		 * Return a `PointerState` to override the pointer for subsequent listeners and contexts, or `null` to remove it.
		 *
		 * If another `InputContext` is passed, pointer events are forwarded to it (equivalent to `ictx.onPointerUpdate((id, ptr) => other.setPointer(id, ptr))`)
		 */
		onPointerUpdate(fn: ((id: number, pointer: PointerState | null, ictx: InputContext) => PointerState | null | void) | InputContext): void
		/**
		 * Listen for new pointers. Called before `onPointerUpdate()` listeners
		 *
		 * Return a `PointerState` to override the pointer for subsequent listeners and contexts, or `null` to remove it.
		 */
		onNewPointer(fn: (id: number, pointer: PointerState, old: null, ictx: InputContext) => PointerState | null | void): void
		/**
		 * Listen for removed pointers. `old` holds the pointer's last state. Called before `onPointerUpdate()` listeners
		 *
		 * Return a `PointerState` to override the pointer for subsequent listeners and contexts (i.e "un-remove" it)
		 */
		onDelPointer(fn: (id: number, pointer: null, old: PointerState, ictx: InputContext) => PointerState | null | void): void
		/**
		 * Listen for any gamepad update (new gamepad, removed gamepad, or a change in an existing gamepad). `gamepad` is `null` if the gamepad was removed.
		 *
		 * Return a `GamepadState` to override the gamepad for subsequent listeners and contexts, or `null` to remove it.
		 *
		 * If another `InputContext` is passed, gamepad events are forwarded to it (equivalent to `ictx.onGamepadUpdate((id, g) => other.setGamepad(id, g))`)
		 */
		onGamepadUpdate(fn: ((id: number, gamepad: GamepadState | null, ictx: InputContext) => GamepadState | null | void) | InputContext): void
		/**
		 * Listen for newly connected gamepads. Called before `onGamepadUpdate()` listeners
		 *
		 * Return a `GamepadState` to override the gamepad for subsequent listeners and contexts, or `null` to remove it.
		 */
		onNewGamepad(fn: (id: number, gamepad: GamepadState, old: null, ictx: InputContext) => GamepadState | null | void): void
		/**
		 * Listen for disconnected gamepads. `old` holds the gamepad's last state. Called before `onGamepadUpdate()` listeners
		 *
		 * Return a `GamepadState` to override the gamepad for subsequent listeners and contexts (i.e "un-remove" it)
		 */
		onDelGamepad(fn: (id: number, gamepad: null, old: GamepadState, ictx: InputContext) => GamepadState | null | void): void
		/**
		 * Listen for mouse wheel events. The delta has already been added to `.wheel` by the time the listener is called
		 *
		 * Return a vec2 to override the delta for subsequent listeners and contexts, or `null` to cancel it (i.e override it with (0, 0))
		 */
		onWheel(fn: (dx: number, dy: number, ictx: InputContext) => vec2 | null | void): void
		/**
		 * Listen for mouse movement events. Deltas are in pixels, with positive y pointing up. The delta has already been added to `.mouse` by the time the listener is called
		 *
		 * Mouse movement is reported both while the pointer is locked (see `pointerLock`) and while it is moving over the canvas normally
		 *
		 * Return a vec2 to override the delta for subsequent listeners and contexts, or `null` to cancel it (i.e override it with (0, 0))
		 */
		onMouse(fn: (dx: number, dy: number, ictx: InputContext) => vec2 | null | void): void
		/**
		 * Listen for device orientation changes. See `InputContext.orientation`
		 * @param t The change in orientation (which has already been applied to `.orientation`)
		 * @param v The device's transient velocity. See `InputContext.transientVelocity`
		 */
		onOrientation(fn: (t: Transform3D, v: vec3) => any): void

		/**
		 * Set the state of a key, firing listeners on this context and propagating to the chain. See `KEY` and `MOUSE` for key IDs. Key IDs are in the range [0, 65535]
		 * @param isDown Whether the key is pressed. Default: `false`
		 * @param refire Fire listeners even if the key's state does not change. Default: `false`
		 * @returns The final value of `isDown` after all listeners and contexts in the chain have had a chance to modify it
		 */
		setKey(key: number, isDown?: boolean, refire?: boolean): boolean
		/** Fire listeners for a key with its current state, as if it had just changed */
		refireKey(key: number): void
		/**
		 * Set, update or remove a pointer, firing listeners on this context and propagating to the chain. The pointer state is copied (see `PointerState`)
		 * @param id Pointer ID. Must be non-negative. ID 0 is the main mouse pointer (see `InputContext.cursor`)
		 * @param pointer The new pointer state, or `null` to remove the pointer. Default: `null`
		 * @param refire Fire listeners even if the pointer did not exist and is being removed. Default: `false`
		 * @returns The final pointer after all listeners and contexts in the chain have had a chance to modify it
		 */
		setPointer(id: number, pointer?: PointerState | null, refire?: boolean): PointerState | null
		/** Fire listeners for a pointer with its current state, as if it had just changed */
		refirePointer(id: number): void
		/** Fire listeners for every pointer on this context with its current state, as if they had just changed. Useful when something that affects how pointers are interpreted (e.g a camera) has changed */
		refirePointers(): void
		/**
		 * Set, update or remove a gamepad, firing listeners on this context and propagating to the chain. The gamepad state is copied (see `GamepadState`)
		 * @param id Gamepad ID. Must be non-negative. For the main context, this is the gamepad's index as given by `navigator.getGamepads()`
		 * @param gamepad The new gamepad state, or `null` to remove the gamepad. Default: `null`
		 * @param refire Fire listeners even if the gamepad did not exist and is being removed. Default: `false`
		 * @returns The final gamepad after all listeners and contexts in the chain have had a chance to modify it
		 */
		setGamepad(id: number, gamepad?: GamepadState | null, refire?: boolean): GamepadState | null
		/** Fire listeners for a gamepad with its current state, as if it had just changed */
		refireGamepad(id: number): void
		/** Fire listeners for every gamepad on this context with its current state, as if they had just changed */
		refireGamepads(): void
		/**
		 * Fire a mouse wheel event, adding to `.wheel`, firing listeners on this context and propagating to the chain
		 * @returns The final delta after all listeners and contexts in the chain have had a chance to modify it
		 */
		fireWheel(dx?: number, dy?: number): vec2
		fireWheel(d: vec2): vec2
		/**
		 * Fire a mouse movement event, adding to `.mouse`, firing listeners on this context and propagating to the chain
		 * @returns The final delta after all listeners and contexts in the chain have had a chance to modify it
		 */
		fireMouse(dx?: number, dy?: number): vec2
		fireMouse(d: vec2): vec2

		/**
		 * Accumulated device orientation (for devices with an orientation sensor, e.g phones), as a rotation from the orientation the device had when the first event was received. Use `.orientation.reset()` to recenter
		 *
		 * To make a 3D camera follow the device, use `ctx3.transformInverse(ictx.orientation)`
		 */
		orientation: Transform3D
		/**
		 * An estimate of the device's current velocity, derived from its accelerometer (if available), relative to the device's current orientation. The estimate decays quickly towards 0 and is only accurate for short, sudden movements (e.g shaking or a quick tilt), not for tracking actual position over time
		 */
		transientVelocity: vec3
		/**
		 * Fire a device orientation event, applying `t` to `.orientation`, firing listeners on this context and propagating to the chain
		 * @param v New value for `.transientVelocity`. If not specified, the velocity is left unchanged
		 */
		fireOrientation(t: Transform3D, v?: vec3 | null): void
	}
	/**
	 * Create a new, empty input context. It is not connected to anything: feed it events with `setKey()`, `setPointer()`, etc..., or chain it from another context (see `InputContext.next`, `InputContext.onKeyUpdate()`)
	 * @example
	 * ```js
	 * const sceneIctx = InputContext()
	 * // Every event reaching ictx (that isn't cancelled by its listeners) now also reaches sceneIctx
	 * ictx.next = sceneIctx
	 * ```
	 */
	function InputContext(): InputContext

	/**
	 * The main input context, fed directly from DOM events on the canvas. See `InputContext`
	 *
	 * The canvas is made focusable and is focused when clicked. Keyboard events are only received while the canvas (or an element passed to `captureKeyEvent()`/`setFocused()`) is focused. When it loses focus, all keys are released and all gamepads are removed
	 */
	const ictx: InputContext

	/**
	 * Whether the pointer is currently locked to the canvas. Assign `true` to request a pointer lock, or `false` to exit it
	 *
	 * Browsers only allow a pointer lock to be requested in response to a user gesture (e.g a click). While locked, the cursor is hidden and mouse movement is still reported (see `InputContext.onMouse()`), but pointer 0 is removed from `ictx` and restored when the lock ends
	 * @example
	 * ```js
	 * ictx.onKey(MOUSE.LEFT, () => { pointerLock = true })
	 * ```
	 */
	let pointerLock: boolean
	/**
	 * Whether the canvas is currently fullscreen. Assign `true` to request fullscreen, or `false` to exit it
	 *
	 * Browsers only allow fullscreen to be requested in response to a user gesture (e.g a click or key press)
	 */
	let fullscreen: boolean

	/**
	 * Hand off the key event currently being processed to another DOM element, focusing it so that it receives the pending event and acts on it appropriately. Must be called from within a key listener
	 *
	 * For example, calling this from a key listener when the user starts typing will focus a text input such that the key typed is entered into the input
	 *
	 * The element is set up to keep feeding key events into `ictx` while focused
	 * @param key The key of the event to capture. Default: 0
	 * @param isDown Whether to capture the key's press (`true`) or release (`false`). Default: `false`
	 */
	function captureKeyEvent(el: HTMLElement, key?: number, isDown?: boolean): void
	/**
	 * Focus a DOM element without releasing any keys, setting it up to keep feeding key events into `ictx` while focused
	 * @param el The element to focus. If not specified, the canvas is focused
	 */
	function setFocused(el?: HTMLElement | null): void
}
