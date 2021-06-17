import _object from './object'
import _text from './text'
import _array from './array'
import _boolean from './boolean'
import _number from './number'
const TYPE_NAME = ['object', 'array', 'text', 'number', 'boolean']

const TYPE = {
    'object': _object,
    'text': _text,
    'array': _array,
    'boolean': _boolean,
    'number': _number
}
export { TYPE, TYPE_NAME }
