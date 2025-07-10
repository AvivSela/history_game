import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'

// Create a proper DOM container for React Testing Library
beforeEach(() => {
  // Create a root div if it doesn't exist
  if (!document.getElementById('root')) {
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)
  }
  
  // Clean up between tests
  document.body.innerHTML = '<div id="root"></div>'
  
  // Reset document classes
  document.body.className = ''
  document.documentElement.className = ''
})

// Mock HTML5 drag and drop APIs
global.DataTransfer = class {
  constructor() {
    this.data = {}
    this.effectAllowed = 'none'
    this.dropEffect = 'none'
  }
  
  setData(format, data) {
    this.data[format] = data
  }
  
  getData(format) {
    return this.data[format] || ''
  }
  
  clearData(format) {
    if (format) {
      delete this.data[format]
    } else {
      this.data = {}
    }
  }
  
  setDragImage() {}
}

// Mock drag event
global.DragEvent = class extends Event {
  constructor(type, init = {}) {
    super(type, init)
    this.dataTransfer = init.dataTransfer || new DataTransfer()
  }
}

// Mock touch event
global.TouchEvent = class extends Event {
  constructor(type, init = {}) {
    super(type, init)
    this.touches = init.touches || []
    this.changedTouches = init.changedTouches || []
    this.targetTouches = init.targetTouches || []
  }
}

// Mock ResizeObserver
global.ResizeObserver = class {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 0)
global.cancelAnimationFrame = (id) => clearTimeout(id)

// Mock CSS.supports
global.CSS = {
  supports: () => true
}

// Mock document.elementFromPoint
global.document.elementFromPoint = vi.fn(() => null)

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  top: 0,
  right: 100,
  bottom: 100,
  left: 0,
  toJSON: () => {}
}))

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock getComputedStyle
global.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
  setProperty: vi.fn()
}))