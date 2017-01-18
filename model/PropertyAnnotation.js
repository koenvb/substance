import isArrayEqual from '../util/isArrayEqual'
import DocumentNode from './DocumentNode'
import CoordinateAdapter from './CoordinateAdapter'

/**
  A property annotation can be used to overlay text and give it a special meaning.
  PropertyAnnotations only work on text properties. If you want to annotate multiple
  nodes you have to use a {@link model/ContainerAnnotation}.

  @prop {String[]} path Identifies a text property in the document (e.g. `['text_1', 'content']`)
  @prop {Number} startOffset the character where the annoation starts
  @prop {Number} endOffset: the character where the annoation starts

  @example

  Here's how a **strong** annotation is created. In Substance annotations are stored
  separately from the text. Annotations are just regular nodes in the document.
  They refer to a certain range (`startOffset, endOffset`) in a text property (`path`).

  ```js
  doc.transaction(function(tx) {
    tx.create({
      id: 's1',
      type: 'strong',
      path: ['p1', 'content'],
      "startOffset": 10,
      "endOffset": 19
    })
  })
  ```
*/
class PropertyAnnotation extends DocumentNode {

  constructor(...args) {
    super(...args)

    // for Coordinate oriented methods (such as CoordinateOperations)
    this._start = new CoordinateAdapter(this, 'path', 'startOffset')
    this._end = new CoordinateAdapter(this, 'path', 'endOffset')
  }

  /**
    Get the plain text spanned by this annotation.

    @returns {String}
  */
  getText() {
    var doc = this.getDocument()
    if (!doc) {
      console.warn('Trying to use an PropertyAnnotation which is not attached to the document.')
      return ""
    }
    var text = doc.get(this.path)
    return text.substring(this.startOffset, this.endOffset)
  }

  /**
    Determines if an annotation can be split e.g., when breaking a node.

    In these cases, a new annotation will be created attached to the created node.

    For certain annotation types,you may want to the annotation truncated
    rather than split, where you need to override this method returning `false`.
  */
  canSplit() {
    return true
  }

  get start() {
    return this._start
  }

  get end() {
    return this._end
  }

  /**
    If this annotation is an Anchor.

    Anchors are annotations with a zero width.
    For instance, ContainerAnnotation have a start and an end anchor,
    or rendered cursors are modeled as anchors.

    @returns {Boolean}
  */
  isAnchor() {
    return false
  }

  // TODO: maybe this should go into documentHelpers
  getSelection() {
    return this.getDocument().createSelection({
      type: 'property',
      path: this.path,
      startOffset: this.startOffset,
      endOffset: this.endOffset
    })
  }

  updateRange(tx, sel) {
    if (!sel.isPropertySelection()) {
      throw new Error('Cannot change to ContainerAnnotation.')
    }
    if (!isArrayEqual(this.startPath, sel.start.path)) {
      tx.set([this.id, 'path'], sel.start.path)
    }
    if (this.startOffset !== sel.start.offset) {
      tx.set([this.id, 'startOffset'], sel.start.offset)
    }
    if (this.endOffset !== sel.end.offset) {
      tx.set([this.id, 'endOffset'], sel.end.offset)
    }
  }

  // WIP
  isInsideOf(sel, _strict) {
    if (sel.isNull()) return false;
    if (_strict) {
      return (isArrayEqual(this.path, sel.path) &&
        this.startOffset > sel.startOffset &&
        this.endOffset < sel.endOffset)
    } else {
      return (isArrayEqual(this.path, sel.path) &&
        this.startOffset >= sel.startOffset &&
        this.endOffset <= sel.endOffset)
    }
  }

  get startPath() {
    return this.path
  }

  get endPath() {
    return this.path
  }
}

PropertyAnnotation.isPropertyAnnotation = true
PropertyAnnotation.prototype._isAnnotation = true
PropertyAnnotation.prototype._isPropertyAnnotation = true

PropertyAnnotation.schema = {
  type: "annotation",
  path: { type: ["array", "string"] },
  startOffset: "number",
  endOffset: "number",
  // this is only used when an annotation is used 'stand-alone'
  // i.e. not attached to a property
  _content: { type: "string", optional: true}
}

export default PropertyAnnotation
