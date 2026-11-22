/// <reference path="./font.d.ts" />
/// <reference path="./gamma-global.d.ts" />
export {}
declare global{
	interface Array<T>{
		/**
		 * Find the element with the highest score, as given by `pred`. If multiple elements share the highest score, the last one is returned
		 * @param pred Called once for each element, should return its score
		 * @param best Elements must score at least this to be returned. Default: `-Infinity`
		 * @returns The best element, or `undefined` if no element scored at least `best` (e.g the array is empty)
		 * @example
		 * ```js
		 * const closest = enemies.best(e => -vec2.magnitude(vec2.subtract(e.pos, player.pos)))
		 * ```
		 */
		best(pred: (el: T, i: number, arr: T[]) => number, best?: number): T | undefined
		/** Like `Array.prototype.map()`, but replaces each element in-place instead of creating a new array. Note that `fn` is only passed the element. Returns `this` */
		mapInPlace(fn: (el: T) => T): this
		/**
		 * Insert an element at a given index, shifting all later elements one place forward
		 * @param idx The index to insert at. Default: `-1`, meaning append to the end (as do any other negative or out-of-range indices)
		 * @returns The new length of the array
		 */
		bind(el: T, idx?: number): number
		/**
		 * Call every element of this array (which should all be functions) with the given arguments, in order. An exception thrown by one function does not stop the others from being called; it is instead reported as an unhandled promise rejection
		 * @example
		 * ```js
		 * const onDeath = []
		 * onDeath.push(() => console.log('Game over!'))
		 * onDeath.fire(player)
		 * ```
		 */
		fire(...args: T extends (...a: infer A) => any ? A : any[]): void
		/** Same as `Array.fire()`, but returns an array of what each function returned (`undefined` for functions that threw) */
		mapFire(...args: T extends (...a: infer A) => any ? A : any[]): (T extends (...a: any[]) => infer R ? R : any)[]
		/**
		 * Remove the first occurrence of an element from the array, shifting all later elements one place back
		 * @returns The index the element was removed from, or `-1` if it wasn't found
		 */
		remove(el: T): number
	}
	interface ArrayConstructor{
		/**
		 * Create an array of a given length, where each element is the result of calling `fn` with its index
		 * @example
		 * ```js
		 * Array.map(5, i => i*i) // [0, 1, 4, 9, 16]
		 * ```
		 */
		map<T>(len: number, fn: (i: number) => T): T[]
	}
	/** The `%TypedArray%` intrinsic, i.e the common superclass of `Uint8Array`, `Float32Array`, etc... Useful for `instanceof` checks */
	const TypedArray: Function & { prototype: Uint8Array | Uint8ClampedArray | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array | BigUint64Array | BigInt64Array }

	interface Uint8ArrayConstructor{
		/**
		 * Decode a hexadecimal string into bytes. Both uppercase and lowercase digits are accepted, and any other characters (e.g spaces or `:`) are skipped. A trailing lone digit is ignored.
		 *
		 * Note that this replaces the browser's native `Uint8Array.fromHex()`, which instead throws on invalid input
		 * @example
		 * ```js
		 * Uint8Array.fromHex('de:ad BE EF') // Uint8Array [0xde, 0xad, 0xbe, 0xef]
		 * ```
		 */
		fromHex(hex: string): Uint8Array
	}
	interface Uint16ArrayConstructor{
		/** Decode a hexadecimal string into 16-bit integers, each made from 4 digits (most significant first). Other characters are skipped, as with `Uint8Array.fromHex()` */
		fromHex(hex: string): Uint16Array
	}

	interface Number{
		/**
		 * Format this number as a 32-bit integer in hexadecimal, always 8 lowercase digits. Negative numbers are formatted as their two's complement
		 * @example
		 * ```js
		 * (255).toHex() // '000000ff'
		 * ```
		 */
		toHex(): string
	}
	interface NumberConstructor{
		/**
		 * Format a number of bytes as a human-readable string, using binary units (`B`, `KiB`, `MiB`, `GiB`, `TiB`) with 1 decimal place
		 * @example
		 * ```js
		 * Number.formatData(1536) // '1.5KiB'
		 * ```
		 */
		formatData(bytes: number): string
	}
	interface DateConstructor{
		/** Format a date in a form that is safe for file names, e.g `2026-11-22-at-14-05-09`. Default: the current date and time */
		kebab(d?: Date): string
	}
	interface Math{
		/** Generate a random signed 32-bit integer */
		randint(): number
	}
	/** Generate a random signed 32-bit integer. Same as `Math.randint()` */
	function randint(): number

	/**
	 * Create a function that resolves paths relative to the directory of a module (or anything with a `url` or `href`). Paths starting with `/` are returned unchanged.
	 *
	 * The returned function can be called with one path, several paths (returning an array), or used as a template tag
	 * @example
	 * ```js
	 * const res = resolver(import.meta)
	 * const tex = Texture.from(res('./player.png'))
	 * const [a, b] = res('a.png', 'b.png')
	 * const level = res`levels/${n}.json`
	 * ```
	 */
	function resolver(base: { url: string } | { href: string }): {
		(path: string): string
		(...paths: string[]): string[]
		(strings: TemplateStringsArray, ...values: any[]): string
	}

	/**
	 * Nanobuf, a small library for compactly encoding data into binary buffers and decoding it back.
	 *
	 * Data is written with a `BufWriter` and read with a `BufReader`, either directly with their methods (e.g `writer.u16(n)`, `reader.u16()`), or through **types** (e.g `Nanobuf.u16`), which can be combined to describe more complex data (see `Nanobuf.Type`, `Nanobuf.Struct()`)
	 *
	 * All multi-byte numbers are big-endian. Reading never throws: reading past the end of the buffer returns "empty" values (0, `''`, an empty array, ...) and sets `BufReader.overran`.
	 *
	 * `Nanobuf` is defined directly on `globalThis`. Its properties are not globals themselves, so destructure the ones you need (as in the examples below)
	 * @example
	 * ```js
	 * const { Struct, Arr, BufWriter, str, f32, u8, b1 } = Nanobuf
	 * const Player = Struct({ name: str, x: f32, y: f32, health: u8, flags: Arr(b1, 4) })
	 * const buf = new BufWriter()
	 * Player.encode(buf, { name: 'Bob', x: 1.5, y: 2, health: 100, flags: [1, 0, 0, 1] })
	 * const player = Player.decode(buf.toReader())
	 * ```
	 */
	namespace Nanobuf{
		/** A shared `TextDecoder`, used to decode UTF-8 strings */
		const decoder: TextDecoder
		/** A shared `TextEncoder`, used to encode UTF-8 strings */
		const encoder: TextEncoder

		/**
		 * A Nanobuf type, describing how to encode and decode values of type `T`.
		 *
		 * Calling the type as a function converts any value into a valid value of that type (e.g `u8(300)` is `44`, `str(5)` is `'5'`). Calling it with no arguments gives the type's default value
		 */
		interface Type<T>{
			(value?: any): T
			/** Write a value to a buffer. The value is assumed to already be valid; call the type as a function first if you're not sure */
			encode(buf: BufWriter, value: T): void
			/** Read a value from a buffer. For types that produce objects or arrays, an existing value can be passed, which will be updated in-place and returned */
			decode(buf: BufReader, value?: T): T
			/** The minimum number of bytes a value of this type takes up when encoded. Bit types (`b1`, `b2`, `b4`) count as 0 */
			readonly minLength: number
		}
		/** The value type described by a `Nanobuf.Type` */
		type ValueOf<X> = X extends Type<infer T> ? T : never

		class BufReader extends DataView{
			/** Construct a new BufReader to read data from a buffer, starting at the beginning */
			constructor(arr: ArrayBufferView | ArrayBuffer)
			/** The current read position, in bytes */
			i: number
			/** Internal state for reading bits. See `.b1()` */
			bitState: number
			/** Same as `type.decode(this, value)` */
			decode<T>(type: Type<T>, value?: T): T
			/**
			 * Read a single bit. Consecutive bit reads (`b1`, `b2`, `b4`) share bytes, so 8 `b1()`s only read one byte. Any other read in between starts a new byte
			 */
			b1(): number
			/** Read 2 bits. See `.b1()` */
			b2(): number
			/** Read 4 bits. See `.b1()` */
			b4(): number
			u8(): number
			i8(): number
			u16(): number
			i16(): number
			u24(): number
			i24(): number
			u32(): number
			i32(): number
			u48(): number
			i48(): number
			/** Read an unsigned 64-bit integer as a number. Values above 2^53 lose precision; see `.bu64()` */
			u64(): number
			/** Read a signed 64-bit integer as a number. Values beyond ±2^53 lose precision; see `.bi64()` */
			i64(): number
			bu64(): bigint
			bi64(): bigint
			f32(): number
			f64(): number
			bool(): boolean
			/** Read a variable-length unsigned integer (1 or 2 bytes, up to 32767). See `BufWriter.v16()` */
			v16(): number
			/** Read a variable-length unsigned integer (1, 2 or 4 bytes, up to 2^31-1). See `BufWriter.v32()` */
			v32(): number
			/** Read a variable-length unsigned integer (1, 2, 4 or 8 bytes, up to 2^63-1). Values above 2^53 lose precision; see `.bv64()`. See `BufWriter.v64()` */
			v64(): number
			/** Same as `.v64()`, but as a bigint */
			bv64(): bigint
			/** Advance a number of bytes without reading them. Useful for padding */
			skip(n: number): void
			/** Read a copied Uint8Array. If `len` is not given (or negative), the length is first read as a `v32` */
			u8arr(len?: number): Uint8Array
			/** Read a UTF-8 string, prefixed by its length in bytes as a `v32` */
			str(): string
			/** Read a value of an enum type, as a string. See `Nanobuf.Enum()` */
			enum(type: EnumType): string
			/** Returns a Uint8Array view of the next `size` bytes, which can be modified. Unlike other methods, **this can throw** if there are not enough bytes left */
			view(size?: number): Uint8Array
			/** Returns a copied Uint8Array of the next `size` bytes */
			array(size?: number): Uint8Array
			/** Returns a copied ArrayBuffer of the next `size` bytes */
			arrayBuffer(size?: number): ArrayBuffer
			/** How many bytes have been read from this buffer so far */
			readonly read: number
			/** How many more bytes can be read before reaching the end of the buffer */
			readonly remaining: number
			/** Whether we have read past the end of the buffer. Once this happens, read methods return "empty" values (i.e `0`, `''`, `Uint8Array(0)`, `false`, ...) */
			readonly overran: boolean
			/** Get a Uint8Array view of the remaining unread data. This is a reference and not a copy. Use `Uint8Array.slice()` to turn it into a copy */
			toUint8Array(): Uint8Array
			/** Copy all the bytes that have already been read into a new ArrayBuffer */
			copyReadToArrayBuffer(): ArrayBuffer
			/** Copy all the bytes yet to be read into a new ArrayBuffer */
			copyRemainingToArrayBuffer(): ArrayBuffer
			/** Same as `new BufWriter(this.copyReadToArrayBuffer(), this.i)` */
			copyToWriter(): BufWriter
			/** Same as `new BufReader(this.copyRemainingToArrayBuffer())` */
			copy(): BufReader
		}

		class BufWriter{
			/**
			 * Construct a new BufWriter. The buffer grows automatically as data is written: when it runs out of space, a new, bigger ArrayBuffer is allocated and the old one is discarded (and may become detached)
			 * @param arr The initial ArrayBuffer to write into. Default: a new 64-byte ArrayBuffer
			 * @param head The position to start writing at. Default: `0`
			 */
			constructor(arr?: ArrayBuffer, head?: number)
			/** The current write position, in bytes */
			i: number
			/** Internal state for writing bits. See `.b1()` */
			bitState: number
			/** Reset the write position to the start, so the buffer can be reused
			 * @param free Whether to also replace the buffer with a new, small one, freeing the memory used by the old one. Default: `false`
			 */
			clear(free?: boolean): void
			/** Same as `type.encode(this, value)` */
			encode<T>(type: Type<T>, value: T): void
			/**
			 * Write a single bit. Consecutive bit writes (`b1`, `b2`, `b4`) are packed into the same bytes, starting from the lowest bit, so 8 `b1()`s only write one byte. Any other write in between starts a new byte
			 */
			b1(n?: number | boolean): void
			/** Write 2 bits. See `.b1()` */
			b2(n?: number): void
			/** Write 4 bits. See `.b1()` */
			b4(n?: number): void
			u8(n?: number): void
			i8(n?: number): void
			u16(n?: number): void
			i16(n?: number): void
			u24(n?: number): void
			i24(n?: number): void
			u32(n?: number): void
			i32(n?: number): void
			u48(n?: number): void
			i48(n?: number): void
			/** Write an unsigned 64-bit integer from a number. Numbers above 2^53 are not exact; see `.bu64()` */
			u64(n?: number): void
			/** Write a signed 64-bit integer from a number. Numbers beyond ±2^53 are not exact; see `.bi64()` */
			i64(n?: number): void
			bu64(n?: bigint): void
			bi64(n?: bigint): void
			f32(n?: number): void
			f64(n?: number): void
			bool(n?: boolean): void
			/**
			 * Write a variable-length unsigned integer, which takes 1 byte for values up to 127, or 2 bytes for values up to 32767. Negative values are written as 0
			 */
			v16(n?: number): void
			/**
			 * Write a variable-length unsigned integer, which takes 1 byte for values up to 63, 2 bytes up to 16383, or 4 bytes up to 2^31-1. Negative values are written as 0. This format is also used for the length of strings and arrays
			 */
			v32(n?: number): void
			/**
			 * Write a variable-length unsigned integer, which takes 1 byte for values up to 63, 2 bytes up to 8191, 4 bytes up to 2^29-1, or 8 bytes up to 2^63-1. Negative values are written as 0
			 */
			v64(n?: number): void
			/** Same as `.v64()`, but from a bigint */
			bv64(n?: bigint): void
			/**
			 * Write a Uint8Array (or the written contents of another BufWriter)
			 * @param len If given (and non-negative), exactly this many bytes are written, and the length is not written. Otherwise, the length is first written as a `v32`, so that `BufReader.u8arr()` can read it back without knowing it
			 */
			u8arr(v: Uint8Array | BufWriter, len?: number): void
			/** Write the contents of an ArrayBuffer, a typed array or another BufWriter as-is, without writing the length */
			append(v: ArrayBuffer | ArrayBufferView | BufWriter): void
			/** Write the bytes of a typed array as-is, without writing the length */
			array(v: ArrayBufferView): void
			/** Write the contents of an ArrayBuffer as-is, without writing the length */
			arrayBuffer(v: ArrayBuffer): void
			/** Advance a number of bytes without writing them. Useful for padding */
			skip(n?: number): void
			/** Write a string as UTF-8, prefixed by its length in bytes as a `v32` */
			str(v?: string): void
			/** Write a value of an enum type, given as a string. Unknown strings are written as the enum's default value. See `Nanobuf.Enum()` */
			enum(type: EnumType, str: string): void
			/** How many bytes have been written so far */
			readonly written: number
			/** The underlying ArrayBuffer being written to. It may be larger than `.written` (to avoid reallocating too often), and may be replaced and detached as the writer grows */
			readonly buffer: ArrayBuffer
			/** Always `0`. Provided so a BufWriter can be used like an `ArrayBufferView` */
			readonly byteOffset: number
			/** Same as `.written`. Provided so a BufWriter can be used like an `ArrayBufferView` */
			readonly byteLength: number
			/** Get a view of the data written so far. This may become detached as the writer grows; consider using a copying method */
			toUint8Array(): Uint8Array
			/** Get a BufReader for the data written so far. This may become detached as the writer grows; consider using a copying method */
			toReader(): BufReader
			/** Get a copy of the data written so far as an ArrayBuffer */
			copyToArrayBuffer(): ArrayBuffer
			/** Get a copy of the data written so far as a new BufWriter */
			copy(): BufWriter
			/** Same as `new BufReader(this.copyToArrayBuffer())` */
			copyToReader(): BufReader
		}

		/** A single bit, as `0` or `1`. See `BufWriter.b1()` */ const b1: Type<number>
		/** 2 bits, i.e an integer in [0, 3]. See `BufWriter.b1()` */ const b2: Type<number>
		/** 4 bits, i.e an integer in [0, 15]. See `BufWriter.b1()` */ const b4: Type<number>
		/** Unsigned 8-bit integer */ const u8: Type<number>
		/** Signed 8-bit integer */ const i8: Type<number>
		/** Unsigned 16-bit integer */ const u16: Type<number>
		/** Signed 16-bit integer */ const i16: Type<number>
		/** Unsigned 24-bit integer */ const u24: Type<number>
		/** Signed 24-bit integer */ const i24: Type<number>
		/** Unsigned 32-bit integer */ const u32: Type<number>
		/** Signed 32-bit integer */ const i32: Type<number>
		/** Unsigned 48-bit integer */ const u48: Type<number>
		/** Signed 48-bit integer */ const i48: Type<number>
		/** Unsigned 64-bit integer, as a number. Values above 2^53 lose precision; see `Nanobuf.bu64` */ const u64: Type<number>
		/** Signed 64-bit integer, as a number. Values beyond ±2^53 lose precision; see `Nanobuf.bi64` */ const i64: Type<number>
		/** Unsigned 64-bit integer, as a bigint */ const bu64: Type<bigint>
		/** Signed 64-bit integer, as a bigint */ const bi64: Type<bigint>
		/** 32-bit float */ const f32: Type<number>
		/** 64-bit float */ const f64: Type<number>
		/** Variable-length unsigned integer, up to 32767. See `BufWriter.v16()` */ const v16: Type<number>
		/** Variable-length unsigned integer, up to 2^31-1. See `BufWriter.v32()` */ const v32: Type<number>
		/** Variable-length unsigned integer, up to 2^63-1. See `BufWriter.v64()` */ const v64: Type<number>
		/** Variable-length unsigned integer, up to 2^63-1, as a bigint. See `BufWriter.v64()` */ const bv64: Type<bigint>
		/** A UTF-8 string, prefixed by its length. See `BufWriter.str()` */ const str: Type<string>
		/** A boolean, taking a whole byte */ const bool: Type<boolean>
		/** A byte array, prefixed by its length. Strings are converted to their UTF-8 bytes. See `BufWriter.u8arr()` */ const u8arr: Type<Uint8Array> & {
			/** A byte array of a fixed length, which is not written. Shorter arrays are padded with zeroes and longer arrays are truncated */
			len(len: number): Type<Uint8Array>
		}

		/** A struct type. See `Nanobuf.Struct()` */
		type StructType<O extends Record<string, Type<any>>> = Type<{ [K in keyof O]: ValueOf<O[K]> }> & {
			/** Create a value of this struct from its fields, in the order they were declared */
			of(...fields: any[]): { [K in keyof O]: ValueOf<O[K]> }
		}
		/**
		 * Create a struct type, which encodes an object's fields one after the other, in the order they are declared
		 * @param fields An object mapping each field name to its type
		 * @param fn Optionally, a function to turn into the type, instead of creating a new one. `encode`, `decode`, `minLength` and `of` are added to it
		 * @example
		 * ```js
		 * const Vec = Struct({ x: f32, y: f32 })
		 * const Line = Struct({ from: Vec, to: Vec, color: u32 })
		 * Line.encode(buf, { from: { x: 0, y: 0 }, to: Vec.of(1, 1), color: 0xff0000ff })
		 * ```
		 */
		function Struct<O extends Record<string, Type<any>>>(fields: O, fn?: Function): StructType<O>

		/** An array type. See `Nanobuf.Arr()` */
		type ArrType<T> = Type<T[]> & {
			/** Create a value of this array type from its elements */
			of(...els: T[]): T[]
		}
		/**
		 * Create an array type, which encodes each element with the given type
		 * @param len If given (and non-negative), arrays always have exactly this many elements and the length is not written: shorter arrays are padded with default values and longer arrays are truncated. Otherwise, the length is written as a `v32`
		 */
		function Arr<T>(type: Type<T>, len?: number): ArrType<T>

		/** Create an optional type, which can also be `null`. Takes one extra byte. `undefined` is treated as `null` */
		function Optional<T>(type: Type<T>): Type<T | null>

		/** An enum type. See `Nanobuf.Enum()` */
		type EnumType = Type<any> & {
			/** Map from each value's name to its integer */
			strToInt: Map<string, number>
			/** Map from each integer to its value's name */
			intToStr: string[]
			/** The integer that unknown names are encoded as: the lowest integer that has no name */
			default: number
			/** The name that unknown integers are decoded as */
			defaultString: string
		}
		/**
		 * Create an enum type, which encodes one of a set of strings as an integer (as a `v32`). Values decode to their name; unknown values decode to `defaultName`.
		 *
		 * Values can be given either as an array of names (numbered `0`, `1`, ...) or as an object mapping each name to its integer
		 * @param defaultName The name unknown values decode to. Default: the first name
		 * @example
		 * ```js
		 * const Dir = Enum(['up', 'down', 'left', 'right'])
		 * Dir.encode(buf, 'left') // writes 2
		 * ```
		 */
		function Enum(values?: string[] | Record<string, number>, defaultName?: string): EnumType

		/** Create a padding type, which skips a number of bytes. Useful to keep fields aligned or reserve space in a `Struct` */
		function Padding(size?: number): Type<void>
	}

	/**
	 * Make the browser download a file
	 * @param file The file's contents
	 * @param name The file's name. Default: `file.name` if it's a `File`, otherwise a name based on its MIME type (e.g `image` for `image/png`)
	 * @example
	 * ```js
	 * download(await canvas.save(), `screenshot-${Date.kebab()}.png`)
	 * ```
	 */
	function download(file: Blob, name?: string): void
	interface HTMLCanvasElement{
		/**
		 * Save the canvas's current contents as an image.
		 *
		 * If the canvas does not preserve its drawing buffer (for a Gamma canvas, when it was created with `Gamma.AUTO_CLEAR_BUFFER`), the contents are only available until the current frame ends. In that case, this **must** be called during the render loop (i.e inside the `loop()` callback, after drawing), otherwise the next frame's contents are saved, which will be empty
		 * @param type The image format, as a MIME type. Default: `'image/png'`
		 * @param quality The image quality, from 0 to 1, for lossy formats such as `'image/jpeg'` and `'image/webp'`
		 * @returns A promise resolving to the image, or `null` if it could not be created (e.g the canvas has a size of 0)
		 * @example
		 * ```js
		 * loop(() => {
		 * 	// ... draw the frame ...
		 * 	if(screenshotRequested){
		 * 		screenshotRequested = false
		 * 		canvas.save().then(img => download(img, `screenshot-${Date.kebab()}.png`))
		 * 	}
		 * })
		 * ```
		 */
		save(type?: string, quality?: number): Promise<Blob | null>
	}
	/**
	 * Construct a color from HSL values, as a `vec4`. Note that the returned color is **not** premultiplied
	 * @param h Hue, in degrees. Any value is accepted and wrapped around (e.g `-60` is the same as `300`)
	 * @param s Saturation, from 0 to 1
	 * @param l Lightness, from 0 to 1
	 * @param a Alpha, from 0 to 1. Default: `1`
	 */
	function hsla(h: number, s: number, l: number, a?: number): vec4
}
