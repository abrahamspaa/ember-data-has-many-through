import { computed } from '@ember/object';
import { assert } from '@ember/debug';
import { isArray } from '@ember/array';

/**
  @method hasManyThrough
  @param hasMany child
  @param hasMany childOfChild
*/

export default function (...args) {
  let childKey = args[0],
    childOfChildKey = args[1];

  return computed(`${childKey}.@each.${childOfChildKey}`, function () {
    let children = this.get(childKey) || [];
    assert('your child is not an array', isArray(children));
    let mappedChildren = children.map(function (child) {
      let childOfChild = child.get(childOfChildKey) || [];
      assert('your childOfChild is not an array', isArray(childOfChild));
      return childOfChild.toArray();
    });
    return [].concat.apply([], mappedChildren);
  });
}
