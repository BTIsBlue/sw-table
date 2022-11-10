export default {
  isString(o) { //是否字符串
    return Object.prototype.toString.call(o).slice(8, -1) === 'String'
  },
  isNumber(o) { //是否数字
    return Object.prototype.toString.call(o).slice(8, -1) === 'Number'
  },
  isObj(o) { //是否对象
    return Object.prototype.toString.call(o).slice(8, -1) === 'Object'
  },
  isEmptyObj(o) { //是否空对象
    return JSON.stringify(o) === '{}'
  },
  isEmptyArray(o) { //是否空数组
    return JSON.stringify(o) === '[]'
  },
  isArray(o) { //是否数组
    return Object.prototype.toString.call(o).slice(8, -1) === 'Array'
  },
  isDate(o) { //是否时间
    return Object.prototype.toString.call(o).slice(8, -1) === 'Date'
  },
  isBoolean(o) { //是否boolean
    return Object.prototype.toString.call(o).slice(8, -1) === 'Boolean'
  },
  isFunction(o) { //是否函数
    return Object.prototype.toString.call(o).slice(8, -1) === 'Function'
  },
  isNull(o) { //是否为null
    return Object.prototype.toString.call(o).slice(8, -1) === 'Null'
  },
  isUndefined(o) { //是否undefined
    return Object.prototype.toString.call(o).slice(8, -1) === 'Undefined'
  },
  isFalse(o) { //是否为false
    if (!o || o === 'null' || o === 'undefined' || o === 'false' || o === 'NaN') {return true}
    return false
  },
  isTrue(o) { //是否为true
    return !this.isFalse(o)
  }
}
