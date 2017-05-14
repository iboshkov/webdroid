import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import LimitRange from './LimitRange'
import { Portal } from '@blueprintjs/core';

const topLeftLimitRange = new LimitRange('top-left')
const topRightLimitRange = new LimitRange('top-right')
const downRightLimitRange = new LimitRange('down-right')
const downLeftLimitRange = new LimitRange('down-left')

const toggleClass = function (el, condition, className) {
  let toggle = condition ? 'add' : 'remove'

  if (typeof condition === 'string' && arguments.length === 2) {
    className = condition
    toggle = el.classList.contains(className) ? 'remove' : 'add'
  }

  el.classList[toggle](className)

  return el
}


class Selection extends React.Component {
  static propTypes = {
    target: PropTypes.string.isRequired,
    selectedClass: PropTypes.string,
    afterSelect: PropTypes.func,
    isLimit: PropTypes.bool,
  }

  static defaultProps = {
    target: '.react-selection-target',
    selectedClass: 'react-selection-selected',
    isLimit: false,
    afterSelect() {

    }
  }

  state = {
    rectangleStyle: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      opacity: 0,
    }
  }

  componentDidMount() {
    this._box = findDOMNode(this)
  }

  mousedown = (ev) => {
    const targetSelect = this.props.target
    this.targets = Array.from(this._box.querySelectorAll(targetSelect))
    this.ctrlKey = (ev.shiftKey || ev.ctrlKey || ev.metaKey)

    if (this.ctrlKey) {
      window.addEventListener('keyup', this.keyup, false)
    } else {
      this.targets.forEach((target) => {
        target.classList.remove(this.props.selectedClass)
      })
    }
    this.clickY = ev.pageY// - ev.currentTarget.offsetTop
    this.clickX = ev.pageX// - ev.currentTarget.offsetLeft

    this.targets.forEach((target) => {
      const { selectedClass } = this.props
      const bounds = target.getBoundingClientRect();
      const tar = {
        x: bounds.left,
        y: bounds.top,
        xx: bounds.right,
        yy: bounds.bottom,
      }
      const isDouble = this.clickX >= tar.x && this.clickX <= tar.xx && this.clickY >= tar.y && this.clickY <= tar.yy;
      
      const hasDataDouble = target.dataset.isDouble === 'true' ? true : false

      if (this.ctrlKey) {
        if (isDouble !== hasDataDouble) {
          toggleClass(target, selectedClass)
          target.dataset.isDouble = isDouble
        }
      } else {
        toggleClass(target, isDouble, selectedClass)
      }
    })

    document.addEventListener('mousemove', this.mousemove, false)
    document.addEventListener('mouseup', this.mouseup, false)
  }

  afterSelect = () => {
    const { afterSelect, selectedClass } = this.props
    afterSelect(this.targets.filter(t => t.classList.contains(selectedClass)))
  }

  keyup = (ev) => {
    if (!this.ctrlKey) return
    this.afterSelect()
    window.removeEventListener('keyup', this.keyup)
  }

  mouseup = (ev) => {
    const { isLimit } = this.props
    this.setState({
      rectangleStyle: {
        ...this.state.rectangleStyle,
        opacity: 0,
      }
    })

    document.removeEventListener('mousemove', this.mousemove)
    document.removeEventListener('mouseup', this.mouseup)


    if (this.ctrlKey) {
      this.targets.forEach((t) => t.removeAttribute('data-is-double'))
    } else {
      this.afterSelect()
    }

    if (isLimit) {
      topLeftLimitRange.reset()
      topRightLimitRange.reset()
      downRightLimitRange.reset()
      downLeftLimitRange.reset()
    }
  }

  mousemove = (ev) => {
    const moveX = (ev.pageX) - this.clickX
    const moveY = (ev.pageY) - this.clickY
    const { isLimit } = this.props

    let rectangleSize = {}

    if (moveX < 0 && moveY < 0) { // top-left
      rectangleSize = {
        left: this.clickX + moveX,
        top: this.clickY + moveY,
        width: moveX * -1,
        height: moveY * -1,
      }

      if (isLimit) {
        rectangleSize = topLeftLimitRange.getNewSize({
          rectangle: rectangleSize,
          container: this._box,
        })
      }
    } else if (moveX > 0 && moveY > 0) { // down-right
      rectangleSize = {
        left: this.clickX,
        top: this.clickY,
        width: moveX,
        height: moveY,
      }

      if (isLimit) {
        rectangleSize = downRightLimitRange.getNewSize({
          rectangle: rectangleSize,
          container: this._box,
        })
      }
    } else if (moveX > 0 && moveY < 0) { // top-right
      rectangleSize = {
        left: this.clickX,
        top: this.clickY + moveY,
        width: moveX,
        height: moveY * -1,
      }

      if (isLimit) {
        rectangleSize = topRightLimitRange.getNewSize({
          rectangle: rectangleSize,
          container: this._box,
        })
      }
    } else if (moveX < 0 && moveY > 0) { // down-left
      rectangleSize = {
        left: this.clickX + moveX,
        top: this.clickY,
        width: moveX * -1,
        height: moveY,
      }

      if (isLimit) {
        rectangleSize = downLeftLimitRange.getNewSize({
          rectangle: rectangleSize,
          container: this._box,
        })
      }
    }

    this.setState({
      rectangleStyle: {
        ...rectangleSize,
        opacity: 1,
      }
    })

    this.targets.forEach((target) => {
      const { selectedClass } = this.props
      const bounds = target.getBoundingClientRect();
      const tar = {
        x: bounds.left,
        y: bounds.top,
        xx: bounds.right,
        yy: bounds.bottom,
      }

      const square = {
        x: rectangleSize.left,
        y: rectangleSize.top,
        xx: rectangleSize.left + rectangleSize.width,
        yy: rectangleSize.top + rectangleSize.height,
      }

      const mouseOver = this.clickX >= tar.x && this.clickX <= tar.xx && this.clickY >= tar.y && this.clickY <= tar.yy;

      const isDouble = Math.max(tar.x, square.x) <= Math.min(tar.xx, square.xx) &&
        Math.max(tar.y, square.y) <= Math.min(tar.yy, square.yy) || (mouseOver)

      const hasDataDouble = target.dataset.isDouble === 'true' ? true : false

      if (this.ctrlKey) {
        if (isDouble !== hasDataDouble) {
          toggleClass(target, selectedClass)
          target.dataset.isDouble = isDouble
        }
      } else {
        toggleClass(target, isDouble, selectedClass)
      }
    })
  }

  shouldComponentUpdate({ target, selectedClass, isLimit },
    { rectangleStyle: { left, top, width, height, opacity } }) {

    const { props, state: { rectangleStyle } } = this

    return true;
  }

  render() {
    const { children, target, ...props } = this.props
    return (
      <div {...props} className="react-selection" onMouseDown={this.mousedown}>
        {children}
        <Portal ref={this.rectangleElement}>
          <div className="react-selection-rectangle" style={this.state.rectangleStyle} />
        </Portal>
      </div>
    )
  }
}

module.exports = Selection