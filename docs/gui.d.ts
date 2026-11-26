/** Gamma pre-release. See license at https://github.com/BlobTheKat/gamma */
/// <reference path="./gamma.d.ts" />
export {}
declare global{
	namespace GammaInstance{ type gui = typeof GammaInstance.gui; }
	namespace Gamma{
		function gui(): GammaInstance.gui
		function gui(o: object): asserts o is GammaInstance.gui
	}
	namespace GammaInstance.gui{
	/**
	 * Base class for GUI elements. You can extend this class to make your own elements, by overriding `_dimensions()` and providing a `draw()` method.
	 *
	 * Width/height are "recommended" dimensions. A parent reads them and usually passes them back to `.draw()`, but it may choose to give the child more (or less) space. A child should always respect the values passed to `.draw()` if it is able to. A width or height of 0 is also used to mean no specific size is requested. If the parent has no reasonable "fallback" or "override" size to provide, the child may end up with a zero size.
	 *
	 * Note that not every built-in element is an actual instance of this class (e.g `GUI.Box`, `GUI.Layer`), but they all share the same interface.
	 */
	class GUIElement{
		/**
		 * Calculate this element's recommended dimensions. Called lazily by `.width`/`.height`, and the result is cached until `.invalidate()` is called.
		 *
		 * Override this in subclasses. Default: returns `vec2.zero`
		 */
		protected _dimensions(): vec2
		/** The recommended width of this element, in units. See `GUIElement` */
		readonly width: number
		/** The recommended height of this element, in units. See `GUIElement` */
		readonly height: number
		/**
		 * Mark this element as changed: clear any cached dimensions and call all dependencies (see `.addDependency()`), which usually propagates the invalidation up to parents.
		 *
		 * This is a bound function, so it can be passed directly as a callback, e.g `texture.then(el.invalidate)`
		 */
		invalidate: () => void
		/** Add a callback to be called whenever this element is invalidated. Parents use this to know when a child has changed. Non-function values are ignored */
		addDependency(cb: () => any): void
		/** Remove a callback previously added with `.addDependency()` */
		removeDependency(cb: () => any): void
		/**
		 * Draw this element. Elements without a `draw` method are not drawn at all
		 * @param ctx The context to draw to. The element occupies the rectangle (0, 0) to (w, h) in this context's coordinate space
		 * @param ictx The input context, used by elements to listen for pointer, key and wheel events (see `GUI.Target`)
		 * @param w The width allocated to this element by its parent
		 * @param h The height allocated to this element by its parent
		 */
		draw?(ctx: Drawable2D, ictx: InputContext, w: number, h: number): void
	}

	/**
	 * Get the canvas's dimensions in CSS pixels, divided by a scale factor, along with the safe area insets (e.g notches and rounded screen corners on mobile devices). Useful for picking a GUI size that is consistent across devices.
	 * @param scale How many CSS pixels make up one unit. Default: `16`
	 */
	function getGUIDimensions(scale?: number): { width: number, height: number, paddingLeft: number, paddingRight: number, paddingBottom: number, paddingTop: number }

	namespace GUI{
		/**
		 * Position of an element within leftover space, as used by `GUI.Box()` and `GUI.BoxFill()`. (0, 0) aligns to the bottom left and (1, 1) to the top right. See also `GUI.MIDDLE`, `GUI.TOP_LEFT`, ...
		 * - A number `n` is the same as `vec2(n, n)`
		 * - A function is called each draw with the leftover width and height (which may be negative if the element is bigger than the space available) and should return a number or vec2
		 */
		type Position = number | vec2 | ((spareWidth: number, spareHeight: number) => number | vec2)
		/**
		 * Scale of an element, as used by `GUI.Box()` and `GUI.BoxFill()`.
		 * - A number scales uniformly
		 * - A vec2 specifies x and y scale separately
		 * - A function is called each draw with the x and y scale that would make the element exactly fill the available space, and should return a number or vec2. For example, `min` gives "contain" behavior and `max` gives "cover" behavior
		 */
		type Size = number | vec2 | ((scaleX: number, scaleY: number) => number | vec2)

		/** See `GUI.Box()` */ const FILL_WIDTH = 1
		/** See `GUI.Box()` */ const CLAMP_WIDTH = 2
		/** See `GUI.Box()` */ const INHERIT_WIDTH = 3
		/** See `GUI.Box()` */ const FILL_HEIGHT = 4
		/** See `GUI.Box()` */ const CLAMP_HEIGHT = 8
		/** See `GUI.Box()` */ const INHERIT_HEIGHT = 12
		/** See `GUI.Box()` */ const FILL = 5
		/** See `GUI.Box()` */ const CLAMP = 10
		/** See `GUI.Box()` */ const INHERIT = 15

		/** `vec2(.5, .5)`. See `GUI.Position` */ const MIDDLE: vec2
		/** `vec2(0, .5)`. See `GUI.Position` */ const LEFT: vec2
		/** `vec2(1, .5)`. See `GUI.Position` */ const RIGHT: vec2
		/** `vec2(.5, 0)`. See `GUI.Position` */ const BOTTOM: vec2
		/** `vec2(.5, 1)`. See `GUI.Position` */ const TOP: vec2
		/** `vec2(0, 0)`. See `GUI.Position` */ const BOTTOM_LEFT: vec2
		/** `vec2(1, 0)`. See `GUI.Position` */ const BOTTOM_RIGHT: vec2
		/** `vec2(0, 1)`. See `GUI.Position` */ const TOP_LEFT: vec2
		/** `vec2(1, 1)`. See `GUI.Position` */ const TOP_RIGHT: vec2

		/**
		 * Create a ZStack, which draws all of its children on top of each other, in order (later children are drawn in front). Each child is given the full space allocated to the stack.
		 *
		 * The recommended width/height of a ZStack is the largest width/height of its children.
		 */
		function ZStack(): ZStack
		interface ZStack extends GUIElement{
			/** The children of this stack, in draw order. Use `.add()`/`.remove()` rather than modifying this directly, so that dependencies are tracked correctly */
			readonly children: GUIElement[]
			/** Add a child to the front of the stack. Returns `this` for chaining */
			add(el: GUIElement): this
			/** Remove a child, either by index or by reference. Does nothing if the child is not found */
			remove(el: number | GUIElement): void
		}

		/**
		 * Create an element that draws a texture, stretched to fill all the space it is given.
		 *
		 * Its recommended dimensions are the texture's width and height
		 */
		function Img(tex: Texture): Img
		interface Img extends GUIElement{
			/** The texture to draw. Call `.invalidate()` after changing it */
			texture: Texture
		}

		/**
		 * Create an element that draws text, from the origin of the space it is given. The text is never scaled or broken to fit the space; for that, see `GUI.Box()` and `RichText.break()`
		 *
		 * Its recommended width is the text's width, and its recommended height is always `1`
		 * @param text The text to draw. If a string is passed, a new `RichText` is created with the given font. Default: `''`
		 * @param font The font to use if `text` is a string. Default: `null`
		 */
		function Text(text?: RichText | string, font?: Font | null): Text
		interface Text extends GUIElement{
			/** The text to draw. Call `.invalidate()` after changing it */
			text: RichText
		}

		/**
		 * Create an invisible element that responds to pointer input (hovering and clicking) over the space it is given. Typically placed inside a `GUI.ZStack` alongside the visible element it makes interactive.
		 *
		 * The first pointer to enter the target captures it until it leaves; other pointers are ignored in the meantime. Pointer events handled by the target are consumed, i.e not passed on to other listeners.
		 * @param onClick A click callback to add. See `Target.onClick()`
		 * @param cursor The cursor hint to show while hovering. Default: `PointerState.POINTER`
		 * @param activeCursor The cursor hint to show while pressed. Default: `PointerState.POINTER`
		 */
		function Target(onClick?: ((x: number, y: number, ptr: PointerState, state: number) => any) | null, cursor?: number | string | null, activeCursor?: number | string | null): Target
		interface Target extends GUIElement{
			/**
			 * The current state of this target
			 * - `0` Idle (no pointer over the target)
			 * - `1` Hovered
			 * - `2` Pressed
			 */
			state: number
			/** The cursor hint to show while hovering, or null to leave it unchanged. See `PointerState`.setHint()` */
			cursor: number | string | null
			/** The cursor hint to show while pressed, or null to leave it unchanged. See `PointerState`.setHint()` */
			activeCursor: number | string | null
			/**
			 * A custom hit test, or null to accept the whole rectangle. Called with a point (x, y) already known to be inside the rectangle (0, 0) to (w, h), and should return whether the point is inside the target. See also `Target.rounded()`
			 */
			hitTest: ((x: number, y: number, w: number, h: number) => boolean) | null
			/** Remove all callbacks added via `.onClick()`/`.onStateChange()` */
			reset(): void
			/**
			 * Add a callback for when the target is clicked, i.e a pointer is pressed and then released over the target. `x` and `y` are the pointer position in the target's coordinate space. Returns `this` for chaining
			 */
			onClick(cb: (x: number, y: number, ptr: PointerState, state: number) => any): this
			/**
			 * Add a callback for whenever a pointer over the target updates (moves, is pressed or released), as well as when it leaves the target. Note that this is called on every update, not just when `state` actually changes; compare `state` to `prevState` if you only care about changes.
			 *
			 * When the pointer leaves, `x`/`y` are `NaN`, `ptr` is `null` and `state` is `0`. Returns `this` for chaining
			 */
			onStateChange(cb: (x: number, y: number, ptr: PointerState | null, state: number, prevState: number) => any): this
			/** Set the cursor hint to show while hovering. Returns `this` for chaining */
			setCursor(cursor: number | string | null): this
			/**
			 * Set `.hitTest` to only accept points inside a rounded rectangle. Returns `this` for chaining
			 * @param tl Top-left corner radius. Default: `0`
			 * @param tr Top-right corner radius. Default: `tl`
			 * @param bl Bottom-left corner radius. Default: `tl`
			 * @param br Bottom-right corner radius. Default: `tl`
			 */
			rounded(tl?: number, tr?: number, bl?: number, br?: number): this
		}

		/**
		 * Create a Box, which positions and scales a child within the space it is given.
		 *
		 * The child is first scaled by `size`, then placed within the leftover space according to `pos`. The child is drawn at its own recommended size (times the scale), unless `flags` says otherwise:
		 * - `GUI.FILL_WIDTH` If the scaled child is narrower than the space available, stretch it to the full width
		 * - `GUI.CLAMP_WIDTH` If the scaled child is wider than the space available, shrink it to the available width
		 * - `GUI.INHERIT_WIDTH` Both of the above, i.e always give the child the full width
		 * - `GUI.FILL_HEIGHT`, `GUI.CLAMP_HEIGHT`, `GUI.INHERIT_HEIGHT` Same for the height
		 * - `GUI.FILL`, `GUI.CLAMP`, `GUI.INHERIT` Same for both width and height
		 *
		 * When a child is stretched or shrunk on an axis, it is aligned to the start of that axis (`pos` is ignored for that axis).
		 *
		 * A Box's own recommended size is `0` by default (i.e it requests no specific size). See `Box.sized()`
		 * @param el The child element
		 * @param pos The child's position. See `GUI.Position`. Default: `.5` (centered)
		 * @param size The child's scale. See `GUI.Size`. Default: `1`
		 * @param flags Any combination of the flags above. Default: `0`
		 */
		function Box(el: GUIElement, pos?: Position, size?: Size, flags?: number): Box
		interface Box extends GUIElement{
			/** The child element. Use `.replace()` to change it */
			readonly child: GUIElement
			/** See `GUI.Box()` and `GUI.Position`. Call `.invalidate()` after changing it */
			pos: Position
			/** See `GUI.Box()` and `GUI.Size`. Call `.invalidate()` after changing it */
			size: Size
			/** See `GUI.Box()`. Call `.invalidate()` after changing it */
			flags: number
			width: number
			height: number
			/** Set this Box's recommended width and height. Returns `this` for chaining */
			sized(w: number, h: number): this
			/** Replace the child element */
			replace(other: GUIElement): void
		}

		/**
		 * Create an element that fills all the space it is given with a texture, similar to a CSS background image. The texture is scaled by `size` and positioned by `pos`, then cropped to the space given. Draws nothing (and waits) until the texture is loaded.
		 *
		 * Its recommended size is `0` (it requests no specific size)
		 * @param tex The texture to draw
		 * @param pos The texture's position. See `GUI.Position`. Default: `.5` (centered)
		 * @param size The texture's scale. See `GUI.Size`. Default: `max` (i.e "cover")
		 * @param tint An optional tint to draw the texture with
		 */
		function BoxFill(tex: Texture, pos?: Position, size?: Size, tint?: vec4): BoxFill
		/**
		 * Create an element that fills all the space it is given with a solid color.
		 *
		 * Its recommended size is `0` (it requests no specific size)
		 */
		function BoxFill(color: vec4): BoxFill
		interface BoxFill extends GUIElement{
			/** The texture to draw, or null to draw a solid color (`.tint`). Call `.invalidate()` after changing it */
			texture: Texture | null
			/** See `GUI.BoxFill()`. Call `.invalidate()` after changing it */
			pos: Position
			/** See `GUI.BoxFill()`. Call `.invalidate()` after changing it */
			size: Size
			/** The tint, or the solid color if `.texture` is null. Call `.invalidate()` after changing it */
			tint: vec4 | undefined
			width: number
			height: number
		}

		/**
		 * Create an element that applies an arbitrary transformation to its child. The child is drawn at its recommended size, with its anchor point placed at the same anchor point of the space given, and the transform is applied around that point.
		 *
		 * Its recommended size is that of its child.
		 * @example
		 * ```js
		 * // Rotate and pulse an element around its center
		 * const spinner = GUI.Transform(el, (ctx, w, h, cw, ch) => {
		 * 	ctx.rotate(t)
		 * 	ctx.scale(1 + sin(t*4)*.1)
		 * })
		 * ```
		 * @param el The child element
		 * @param transform Called on every draw to transform the context. `w`/`h` are the space given, `childWidth`/`childHeight` are the child's recommended size. Default: no transformation
		 * @param anchorX The anchor point's x, from `0` (left) to `1` (right). Default: `.5`
		 * @param anchorY The anchor point's y, from `0` (bottom) to `1` (top). Default: `.5`
		 */
		function Transform(el: GUIElement, transform?: (ctx: Drawable2D, w: number, h: number, childWidth: number, childHeight: number) => any, anchorX?: number, anchorY?: number): Transform
		interface Transform extends GUIElement{
			/** The child element. Use `.replace()` to change it */
			readonly child: GUIElement
			/** See `GUI.Transform()` */
			transform: (ctx: Drawable2D, w: number, h: number, childWidth: number, childHeight: number) => any
			/** See `GUI.Transform()` */
			anchorX: number
			/** See `GUI.Transform()` */
			anchorY: number
			/** Replace the child element */
			replace(other: GUIElement): void
		}

		/**
		 * Create a Layer, which draws its child to an offscreen texture and then draws that texture. The child is only redrawn when it is invalidated, when the space given changes, or when the layer's on-screen transform changes by more than `.tolerance`. This can save a lot of work for complex elements that rarely change.
		 *
		 * The texture covers only the part of the layer that is visible on screen, at screen resolution. Layers draw using the stencil buffer (see `Gamma.STENCIL`).
		 *
		 * Input events are forwarded to the child through the layer's own input context (`.ictx`), with pointer positions converted to be relative to the layer.
		 *
		 * A Layer's own recommended size is `0` by default (i.e it requests no specific size). See `Layer.sized()`
		 */
		function Layer(el: GUIElement): Layer
		namespace Layer{
			/**
			 * A function that can be used as `Layer.debug` to briefly flash the layer red every time it is redrawn
			 * @example
			 * ```js
			 * layer.debug = GUI.Layer.flashRedraw
			 * ```
			 */
			function flashRedraw(this: Layer, ctx: Drawable2D): void
		}
		interface Layer extends GUIElement{
			/** The child element. Use `.replace()` to change it */
			readonly child: GUIElement
			width: number
			height: number
			/** Set this Layer's recommended width and height. Returns `this` for chaining */
			sized(w: number, h: number): this
			/** Replace the child element */
			replace(other: GUIElement): void
			/** The input context passed to the child */
			readonly ictx: InputContext
			/** Options for the backing texture. See `Texture()`. Takes effect the next time the child is redrawn. Default: `0` */
			options: number
			/** Format of the backing texture. See `Formats`. Changing it recreates the texture the next time the child is redrawn. Default: `Formats.RGBA` */
			format: Formats
			/** Mipmap count of the backing texture. See `Texture()`. Changing it recreates the texture the next time the child is redrawn. If the texture can't have that many mipmaps, this is updated to the actual count. Default: `1` */
			mipmaps: number
			/**
			 * How far, in pixels, any corner of the layer can move on screen before the child is redrawn. Higher values mean fewer redraws but more visible artifacts while the layer is moving. Default: `0.25`
			 */
			tolerance: number
			/** An extra relative tolerance for the depth component, for layers drawn with a perspective transform. Default: `0.01` */
			depthTolerance: number
			/** The value of `t` the last time the child was redrawn, or `-1` if it has never been drawn */
			readonly lastRedraw: number
			/**
			 * Called after the layer is drawn, with the context transformed so that the layer covers (0, 0) to (1, 1). Useful for debugging. Default: `null`. See also `GUI.Layer.flashRedraw`
			 */
			debug: ((this: Layer, ctx: Drawable2D) => any) | null
			/**
			 * An optional hook called before the child is redrawn, with the same arguments the child will be drawn with. It may return a function, which is called after the child is drawn
			 */
			predraw?(ctx: Drawable2D, ictx: InputContext, w: number, h: number): (() => any) | void
		}

		/**
		 * Create a ScrollableLayer, a `GUI.Layer` that lets the user scroll its child with the mouse wheel (or touchpad) when the child is bigger than the space given, and draws scrollbars.
		 *
		 * The child is drawn at its recommended size.
		 * @param el The child element
		 * @param anchorX Which point of the child is aligned to the same point of the layer when not scrolled, from `0` (left) to `1` (right). A vec2 can also be passed to specify both `anchorX` and `anchorY`. Default: `0`
		 * @param anchorY Same as `anchorX` for the y axis, from `0` (bottom) to `1` (top). Default: `1` (i.e the default anchor is the top left)
		 */
		function ScrollableLayer(el: GUIElement, anchorX?: number, anchorY?: number): ScrollableLayer
		function ScrollableLayer(el: GUIElement, anchor: vec2): ScrollableLayer
		namespace ScrollableLayer{
			/** The default scrollbar drawing function. See `ScrollableLayer.scrollBarX` */
			function defaultScrollbar(ctx: Drawable2D, start: number, size: number, length: number): void
		}
		interface ScrollableLayer extends Layer{
			/** See `GUI.ScrollableLayer()` */
			anchorX: number
			/** See `GUI.ScrollableLayer()` */
			anchorY: number
			/**
			 * The current scroll offset on the x axis, in units, relative to the anchored position. It is kept between `-overflow*anchorX` and `overflow*(1-anchorX)`, where `overflow` is how much wider the child is than the layer. Call `.invalidate()` after changing it
			 */
			x: number
			/**
			 * The current scroll offset on the y axis, in units, relative to the anchored position. It is kept between `-overflow*anchorY` and `overflow*(1-anchorY)`, where `overflow` is how much taller the child is than the layer. Call `.invalidate()` after changing it
			 */
			y: number
			/** How many units to scroll per unit of wheel delta. Default: `.0625` */
			sensitivity: number
			/** How long, in seconds, scrolling takes to ease out. `0` means scrolling is instant. Default: `.05` */
			easing: number
			/**
			 * Function used to draw the horizontal scrollbar, or null for none. It is only drawn when the child is wider than the layer.
			 *
			 * The context is transformed so that the scrollbar's track runs along the x axis, from `0` to `length`
			 * @param start Where the visible part starts, as a fraction of the child's total size
			 * @param size The size of the visible part, as a fraction of the child's total size
			 * @param length The length of the track, in units
			 *
			 * Default: `GUI.ScrollableLayer.defaultScrollbar`
			 */
			scrollBarX: ((ctx: Drawable2D, start: number, size: number, length: number) => any) | null
			/** Same as `.scrollBarX` for the vertical scrollbar. It is only drawn when the child is taller than the layer */
			scrollBarY: ((ctx: Drawable2D, start: number, size: number, length: number) => any) | null
			/** Shorthand to get `.scrollBarY` or set both `.scrollBarX` and `.scrollBarY` */
			scrollbar: ((ctx: Drawable2D, start: number, size: number, length: number) => any) | null
		}

		/**
		 * Create an element that adds padding around its child. Note the order of the arguments.
		 *
		 * Its recommended size is that of its child, plus the padding.
		 * @param el The child element
		 * @param bottom Default: `0`
		 * @param left Default: `bottom`
		 * @param top Default: `bottom`
		 * @param right Default: `left`
		 */
		function Padding(el: GUIElement, bottom?: number, left?: number, top?: number, right?: number): Padding
		interface Padding extends GUIElement{
			/** The child element. Use `.replace()` to change it */
			readonly child: GUIElement
			/** Call `.invalidate()` after changing it */ bottom: number
			/** Call `.invalidate()` after changing it */ left: number
			/** Call `.invalidate()` after changing it */ top: number
			/** Call `.invalidate()` after changing it */ right: number
			/** Replace the child element */
			replace(other: GUIElement): void
		}

		/**
		 * Create a single-line editable text field. Editing is backed by a hidden HTML input element, so typing, IME, clipboard, undo, and keyboard navigation all behave natively. Clicking focuses the field and places the cursor, dragging selects text, double-clicking selects a word and triple-clicking selects a line.
		 *
		 * Its recommended width is the width of the rendered text, and its recommended height is `lineHeight` times the number of lines.
		 * @param transformer A function turning the field's value into a `RichText`. See `TextField.transformer`
		 */
		function TextField(transformer?: (value: string, field: TextField) => RichText): TextField
		/**
		 * Create a single-line editable text field, using `TextField.simpleTransformer()`. See `TextField.simpleTransformer()` for arguments.
		 */
		function TextField(font: Font, placeholder?: string, ...values: any[]): TextField
		namespace TextField{
			/** Same as `GUI.TextField()` but creates a multi-line text field. See `TextField.multiline` */
			function multiline(transformer?: (value: string, field: TextField) => RichText): TextField
			function multiline(font: Font, placeholder?: string, ...values: any[]): TextField
			/** Time, in seconds, since the user last interacted with any text field (typed, moved the cursor or focused one). Useful for making a cursor that stops blinking while typing. See `TextField.drawCursor` */
			function cursorTimer(): number
		}
		interface TextField extends GUIElement{
			/** The text in the field */
			value: string
			/** Whether the field is focused (i.e receives keyboard input). Only one field can be focused at a time */
			focus: boolean
			/** Whether this field allows multiple lines. Multi-line fields break their text into lines no wider than `.maxWidth` */
			multiline: boolean

			/**
			 * The selection anchor, i.e the index in `.value` where the selection started. Equal to `.sel1` when nothing is selected (just a cursor)
			 */
			sel0: number
			/** The selection focus, i.e the index in `.value` where the selection ends and the cursor is. Can be before `.sel0` for backward selections */
			sel1: number
			/** Set the selection anchor and focus in one go. See `.sel0` and `.sel1` */
			select(sel0: number, sel1?: number): void
			/** The start of the selection, i.e `min(sel0, sel1)` */
			readonly selStart: number
			/** The end of the selection, i.e `max(sel0, sel1)` */
			readonly selEnd: number
			/** Whether the user is currently selecting text with a pointer */
			readonly isSelecting: boolean
			/**
			 * For single-line fields, the x position (in units) of the start of the selection.
			 *
			 * For multi-line fields, the line index of the start of the selection
			 */
			readonly sel0pos: number
			/**
			 * For single-line fields, the x position (in units) of the end of the selection.
			 *
			 * For multi-line fields, the line index of the end of the selection
			 */
			readonly sel1pos: number

			/**
			 * Replace the selection with some text, and move the cursor
			 * @param text Default: `''`
			 * @param cursor Where to put the cursor, relative to the start of the inserted text. Default: `text.length` (after the inserted text)
			 */
			insert(text?: string, cursor?: number): void

			/** Whether pressing Tab inserts a tab character (when it doesn't call `.tabCb`). Default: `false` */
			allowTabs: boolean
			/** If `false`, up/down arrows call `.upArrowCb`/`.downArrowCb` and Shift + up/down arrows move the cursor. If `true`, it's the other way around. Default: `false` */
			shiftArrows: boolean
			/** If `false`, Enter calls `.enterCb` and Shift + Enter inserts a newline (multi-line fields only). If `true`, it's the other way around. Default: `false` */
			shiftEnter: boolean
			/** If `false`, Tab calls `.tabCb` and Shift + Tab inserts a tab (if `.allowTabs` is `true`). If `true`, it's the other way around. Default: `false` */
			shiftTab: boolean
			/** Called when the up arrow is pressed. See `.shiftArrows` */
			upArrowCb: (() => any) | null
			/** Called when the down arrow is pressed. See `.shiftArrows` */
			downArrowCb: (() => any) | null
			/** Called when Enter is pressed. See `.shiftEnter` */
			enterCb: (() => any) | null
			/** Called when Tab is pressed. See `.shiftTab` */
			tabCb: (() => any) | null

			/**
			 * A function turning the field's value into a `RichText`, called whenever the value, selection or styling changes. This is where you set the font, colors, placeholder text, syntax highlighting, etc...
			 *
			 * The returned text should have the same length as the value (see `RichText.index`), so that selection and cursor positions line up. If null, nothing is drawn
			 */
			transformer: ((value: string, field: TextField) => RichText) | null
			/**
			 * Set `.transformer` to a simple one that draws the value in a single font and style, and also sets `.lineAscend` for that font. Returns `this` for chaining
			 * @param font The font to use
			 * @param placeholder Text shown (dimmed) when the field is empty. Default: `''`
			 * @param values The "values" passed to the shader. See `RichText.setTextPass()`. The first value is the color by convention, and the placeholder uses that color multiplied by `.4`
			 */
			simpleTransformer(font: Font, placeholder?: string, ...values: any[]): this
			/**
			 * Function used to draw the cursor, or null for no cursor. It is inserted into the text at the cursor position (see `RichText.addCb()`) while the field is focused and nothing is selected. Default: a blinking white bar
			 */
			drawCursor: ((ctx: Drawable2D, font: Font) => any) | null
			/**
			 * Function used to style the selected part of the text, or null for no styling. It is called with a `RichText` containing only the selected text, and should modify it (e.g using `RichText.insertLinePass()`). Default: a blue highlight when focused, gray otherwise
			 */
			selector: ((selected: RichText, field: TextField) => any) | null
			/** The rendered text, for single-line fields, otherwise null */
			readonly line: RichText | null
			/** The rendered lines, for multi-line fields, otherwise null */
			readonly lines: RichText[] | null
			/** The maximum line width used to break the text of multi-line fields, in units. See `RichText.break()`. Default: `Infinity` */
			maxWidth: number
			/** Whether `.maxWidth` should automatically follow the width given to the field when drawn. Default: `false` */
			autoWidth: boolean
			/** Set `.autoWidth`. Returns `this` for chaining. `b` defaults to `true` */
			setAutoWidth(b?: boolean): this
			/**
			 * The distance between lines, in units. This also defines the field's recommended height. A negative value inverts the direction in which lines go: the first line is at the bottom and new lines are added above it. Default: `1.3`
			 */
			lineHeight: number
			/** How far below the top of each line the baseline is, in units. Default: `.9`. See `.calcAscend()` */
			lineAscend: number
			/**
			 * Set `.lineAscend` to the correct value for a font, waiting for it to load if necessary. Returns `this` for chaining
			 * @param size The text scale used. Default: `1`
			 */
			calcAscend(font: Font, size?: number): this
			/** Invert the direction in which lines go. See `.lineHeight`. Returns `this` for chaining */
			invertWrapDirection(): this
			/** Rebuild the rendered text right now. This is normally done for you, shortly after anything changes */
			recalc: () => void
		}
	}

	/**
	 * Configuration object for a `ParticleContainer`, describing how particles of type `P` are created, updated and drawn
	 */
	interface ParticleConfig<P = any>{
		/** Create a new particle, from the arguments passed to `ParticleContainer.add()` */
		init(...args: any[]): P
		/**
		 * Update and draw a particle. Called once per particle per frame, in reverse order of creation (i.e newest particles are drawn first)
		 * @param dt Time since the last frame, in seconds
		 * @returns `true` to remove the particle, falsy to keep it
		 */
		update(ctx: Drawable2D, particle: P, dt: number): boolean | void
		/** Optionally called once per frame before any particles are updated, with the arguments passed to the container's `draw()`. May return a new context to draw particles with */
		prepare?(ctx: Drawable2D, ictx: InputContext, w: number, h: number): Drawable2D | void
	}
	/**
	 * An element that manages and draws many short-lived particles. It keeps redrawing itself (via `.invalidate()`) as long as it has any particles.
	 *
	 * A ParticleContainer's own recommended size is `0` by default (i.e it requests no specific size). See `ParticleContainer.sized()`
	 * @example
	 * ```js
	 * const sparks = new ParticleContainer({
	 * 	init: (x, y) => ({x, y, life: 1}),
	 * 	update(ctx, p, dt){
	 * 		p.y += dt; p.life -= dt
	 * 		ctx.drawRect(p.x, p.y, .1, .1, vec4(p.life))
	 * 		return p.life <= 0
	 * 	}
	 * })
	 * sparks.add(0, 0)
	 * ```
	 */
	class ParticleContainer<P = any> extends GUIElement{
		constructor(config: ParticleConfig<P>)
		/** The particle configuration. Setting it removes all existing particles */
		config: ParticleConfig<P>
		/** The value of `t` the last time particles were updated */
		lastT: number
		width: number
		height: number
		/** Set this ParticleContainer's recommended width and height. Returns `this` for chaining */
		sized(w: number, h: number): this
		/** Add a particle, passing all arguments to `config.init()` */
		add(...args: any[]): void
	}
}

}