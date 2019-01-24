import { all } from 'rsvp';
import { run } from '@ember/runloop';
import {
  moduleForModel,
  test
} from 'ember-qunit';
import wait from 'ember-test-helpers/wait';

moduleForModel('author', 'Unit | Model | author', {
  needs: [
    'model:book',
    'model:chapter'
  ]
});

test('hasManyThrough on hasMany of one hasMany', function (assert) {
  let store = this.store(),
    chapter1, chapter2, book, author;
  author = this.subject();
  run(() => {
    chapter1 = store.createRecord('chapter');
    chapter2 = store.createRecord('chapter');
    book = store.createRecord('book');
    return author.get('books').then((books) => {
      return book.get('chapters').then((chapters) => {
        const arrayOfChapter = [chapter1];

        chapters.pushObjects(arrayOfChapter);
        book.get('chaptersArray').pushObjects(arrayOfChapter);
        books.pushObject(book);
        return author.get('chapters').then((res) => {
          assert.deepEqual(
            res,
            arrayOfChapter,
            'the hasManyThrough property forwards the hasMany of one hasMany book'
          );
          assert.deepEqual(
            author.get('chapters.content'),
            arrayOfChapter,
            'the hasManyThrough property is a promiseArray'
          );
          return author.get('chaptersArray');
        }).then((res) => {
          assert.deepEqual(
            res,
            arrayOfChapter,
            'the hasManyThrough property forwards the CP array of one hasMany book'
          );
          assert.deepEqual(
            author.get('chaptersArray.content'),
            arrayOfChapter,
            'the hasManyThrough property is a promiseArray'
          );
          return author.get('chapters');
        }).then((res) => {
          assert.deepEqual(
            res,
            arrayOfChapter,
            'the hasManyThrough property can be aliased to another property name'
          );
          return all([
            author.get('chapters'),
            author.get('chaptersArray'),
            author.get('chapters')
          ]);
        }).then(() => {
          const arrayOfChapter = [chapter1, chapter2];
          chapters.pushObjects(arrayOfChapter);
          book.get('chaptersArray').pushObjects(arrayOfChapter);
          books.pushObject(book);
          return author.get('chapters').then((res) => {
            assert.deepEqual(
              res,
              arrayOfChapter,
              'the hasManyThrough property forwards the hasMany of one hasMany book after adding a record'
            );
            assert.deepEqual(
              author.get('chapters.content'),
              arrayOfChapter,
              'the hasManyThrough property is a promiseArray after adding a record'
            );
            return author.get('chaptersArray');
          }).then((res) => {
            assert.deepEqual(
              res,
              arrayOfChapter,
              'the hasManyThrough property forwards the CP array of one hasMany book after adding a record'
            );
            assert.deepEqual(
              author.get('chaptersArray.content'),
              arrayOfChapter,
              'the hasManyThrough property is a promiseArray after adding a record'
            );
            return author.get('chapters');
          }).then((res) => {
            assert.deepEqual(
              res,
              arrayOfChapter,
              'the hasManyThrough property can be aliased to another property name after adding a record'
            );
            return true;
          });
        });
      });
    });
  });
  return wait();
});

test('hasManyThrough on hasMany of several hasMany', function (assert) {
  let store = this.store(),
    book1, book2, chapter1, chapter2, chapter3, author;
  author = this.subject();
  run(() => {
    chapter1 = store.createRecord('chapter');
    chapter2 = store.createRecord('chapter');
    chapter3 = store.createRecord('chapter');
    book1 = store.createRecord('book');
    book2 = store.createRecord('book');
    let arrayOfChapter = [chapter1, chapter2, chapter3];
    return author.get('books').then((books) => {
      let prom = [
        book1.get('chapters').then((chapters) => {
          chapters.pushObjects([chapter1, chapter2]);
          book1.get('chaptersArray').pushObjects([chapter1, chapter2]);
        }),
        book2.get('chapters').then((chapters) => {
          chapters.pushObjects([chapter2, chapter3]);
          book2.get('chaptersArray').pushObjects([chapter2, chapter3]);
        })
      ];
      return all(prom).then(() => {
        books.pushObjects([book1, book2]);
        return author.get('chapters');
      });
    }).then((res) => {
      assert.deepEqual(
        res,
        arrayOfChapter,
        'the hasManyThrough property forwards the hasMany of two hasMany books'
      );
      assert.equal(
        res.get('length'),
        3,
        'the hasManyThrough property removes duplicates from the final array'
      );
      return author.get('chaptersArray');
    }).then((res) => {
      assert.deepEqual(
        res,
        arrayOfChapter,
        'the hasManyThrough property forwards the CP array of two hasMany books'
      );
      assert.equal(
        res.get('length'),
        3,
        'the hasManyThrough property removes duplicates from the final array'
      );
      return chapter1.destroyRecord();
    }).then(() => {
      return author.get('chapters');
    }).then(() => {
      assert.deepEqual(
        author.get('chapters.content'),
        [chapter2, chapter3],
        'the hasManyThrough property removes destroyed records'
      );
      return author.get('chaptersArray');
    }).then(() => {
      assert.deepEqual(
        author.get('chaptersArray.content'),
        [chapter2, chapter3],
        'the hasManyThrough property removes destroyed records of the CP array'
      );
      return chapter2.destroyRecord();
    }).then(() => {
      return author.get('chapters');
    }).then(() => {
      assert.deepEqual(
        author.get('chapters.content'),
        [chapter3],
        'the hasManyThrough property removes destroyed records taking properly into account duplicates'
      )
      return author.get('chaptersArray');
    }).then(() => {
      assert.deepEqual(
        author.get('chaptersArray.content'),
        [chapter3],
        'the hasManyThrough property removes destroyed records of the CP array'
      )
      return true;
    });
  });
  return wait();
});

test('hasManyThrough on hasMany of one or zero belongsTo', function (assert) {
  let store = this.store(),
    book1, book2, chapter1, chapter2, author;
  author = this.subject();
  run(() => {
    chapter1 = store.createRecord('chapter');
    chapter2 = store.createRecord('chapter');
    book1 = store.createRecord('book');
    book2 = store.createRecord('book');
    return author.get('books').then((books) => {
      book1.set('chapter', chapter1);
      book2.set('chapter', chapter2);
      books.pushObjects([book1, book2]);
      return author.get('chaptersBelongsTo');
    }).then((res) => {
      assert.deepEqual(
        res,
        [chapter1, chapter2],
        'the hasManyThrough property forwards the hasMany of belongsTo chapter'
      );
      return chapter1.destroyRecord();
    }).then(() => {
      return author.get('chaptersBelongsTo');
    }).then(() => {
      assert.deepEqual(
        author.get('chaptersBelongsTo.content'),
        [chapter2],
        'the hasManyThrough property removes destroyed records'
      )
      return chapter2.destroyRecord();
    }).then(() => {
      return author.get('chaptersBelongsTo');
    }).then(() => {
      assert.deepEqual(
        author.get('chaptersBelongsTo.content'),
        [],
        'the hasManyThrough property removes destroyed records'
      )
      return true;
    });
  });
  return wait();
});

test('hasManyThroughNonOject on hasMany of several hasMany', function (assert) {
  let store = this.store(),
    book1, book2, author;
  author = this.subject();
  run(() => {
    book1 = store.createRecord('book');
    book2 = store.createRecord('book');
    let arrayOfChapter = ['chapter1', 'chapter2', 'chapter3'];
    author.get('books').then((books) => {
      book1.set('simpleArray', ['chapter1', 'chapter2']);
      book2.set('simpleArray', ['chapter2', 'chapter3']);
      books.pushObjects([book1, book2]);
      return author.get('simpleArray');
    }).then((res) => {
      assert.deepEqual(
        res,
        arrayOfChapter,
        'the hasManyThroughNonObject property forwards the hasMany of two hasMany books'
      );
      assert.equal(
        res.get('length'),
        3,
        'the hasManyThroughNonObject property removes duplicates from the final array'
      );
    }).then(() => {
        book1.get('simpleArray').removeObject('chapter1');
        return author.get('simpleArray');
    }).then(() => {
      assert.deepEqual(
        author.get('simpleArray.content'),
        ['chapter2', 'chapter3'],
        'the hasManyThrough property removes destroyed records'
      )
    });
  });
  return wait();
});

test('concat', function (assert) {
  let store = this.store(),
    chapter1, chapter2, author;
  author = this.subject();
  run(() => {
    chapter1 = store.createRecord('book');
    chapter2 = store.createRecord('book');
    let arrayOfChapter = ['chapter1', 'chapter2', 'chapter2', 'chapter3'];
    author.get('books').then((books) => {
      chapter1.set('simpleArray', ['chapter1', 'chapter2']);
      chapter2.set('simpleArray', ['chapter2', 'chapter3']);
      books.pushObjects([chapter1, chapter2]);
      return author.get('concatArray');
    }).then((res) => {
      assert.deepEqual(
        res,
        arrayOfChapter,
        'the concat property forwards the hasMany of two hasMany books'
      );
      assert.equal(
        res.get('length'),
        4,
        'the concat property does not remove duplicates from the final array'
      );
    }).then(() => {
        chapter1.get('simpleArray').removeObject('chapter1');
        return author.get('simpleArray');
    }).then(() => {
      assert.deepEqual(
        author.get('simpleArray.content'),
        ['chapter2', 'chapter3'],
        'the concat property removes destroyed records'
      )
    });
  });
  return wait();
});
