/*
 * sbmtjs - Storage-backed Merkle tree
 * Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
 *
 * This file is part of sbmtjs.
 *
 * sbmtjs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * sbmtjs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with sbmtjs.  If not, see <http://www.gnu.org/licenses/>.
 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const path = require('path');
const fs = require('fs');
const del = require('del');

const assert = chai.assert;

const RocksDb = require('../src/storage/rocksdb');
const MerkleTree = require('../src/tree');
const Mimc7Hasher = require('../src/hasher/mimc7');

describe('tree test', function () {
  let prefix = 'test';
  let tree;
  let hasher;
  const default_value = '4';
  let rollback_root;

  before( () => {
    const storage_path = '/tmp/rocksdb_tree_test';
    if (fs.existsSync(storage_path)) {
      del.sync(storage_path, { force: true });
    }
    const storage = new RocksDb(storage_path);
    hasher = new Mimc7Hasher();
    tree = new MerkleTree(
      prefix,
      storage,
      hasher,
      2,
      default_value,
    );
  });

  it('tests index', async () => {
    assert.equal(
      MerkleTree.index_to_key('test', 5, 20),
      "test_tree_5_20",
    );
  });

  it('tests empty get', async () => {
    let {root, path_elements, path_index} = await tree.path(2);
    const calculated_root = hasher.hash(1,
      path_elements[1],
      hasher.hash(0, default_value, path_elements[0]),
    );
    assert.equal(root, calculated_root);
  });
  it('tests insert', async () => {
    await tree.update(0, '5');
    rollback_root = (await tree.path(0)).root;
    let {root, path_elements, path_index} = await tree.path(0);
    const calculated_root = hasher.hash(1,
      hasher.hash(0, '5', path_elements[0]),
      path_elements[1],
    );
    assert.equal(root, calculated_root);
  });

  it('tests updated', async () => {
    await tree.update(1, '6');
    await tree.update(2, '9');
    await tree.update(2, '8');
    await tree.update(2, '82');
    let {root, path_elements, path_index} = await tree.path(0);
    const calculated_root = hasher.hash(1,
      hasher.hash(0, '5', path_elements[0]),
      path_elements[1],
    );
    assert.equal(root, calculated_root);
    const wrong_calculated_root = hasher.hash(1,
      hasher.hash(0, '6', path_elements[0]),
      path_elements[1],
    );
    assert.notEqual(root, wrong_calculated_root);
  });

  it('tests update log', async () => {
    const update_log_key = MerkleTree.update_log_to_key(prefix);
    const update_log_index = await tree.storage.get(update_log_key);
    assert.equal(update_log_index, 4);
    const update_log_element_key = MerkleTree.update_log_element_to_key(prefix, update_log_index);
    const update_log_element = JSON.parse(await tree.storage.get(update_log_element_key));
    assert.equal(update_log_element.old_element, '8');
    assert.equal(update_log_element.new_element, '82');
  });

  it('tests rollback', async () => {
    {
      await tree.rollback(1);
      const update_log_key = MerkleTree.update_log_to_key(prefix);
      const update_log_index = await tree.storage.get(update_log_key);
      assert.equal(update_log_index, 3);
      const update_log_element_key = MerkleTree.update_log_element_to_key(prefix, update_log_index);
      const update_log_element = JSON.parse(await tree.storage.get(update_log_element_key));
      assert.equal(update_log_element.old_element, '9');
      assert.equal(update_log_element.new_element, '8');
    }

    {
      await tree.rollback(1);
      const update_log_key = MerkleTree.update_log_to_key(prefix);
      const update_log_index = await tree.storage.get(update_log_key);
      assert.equal(update_log_index, 2);
      const update_log_element_key = MerkleTree.update_log_element_to_key(prefix, update_log_index);
      const update_log_element = JSON.parse(await tree.storage.get(update_log_element_key));
      assert.equal(update_log_element.old_element, '4');
      assert.equal(update_log_element.new_element, '9');
    }

    {
      await tree.rollback_to_root(rollback_root);
      const update_log_key = MerkleTree.update_log_to_key(prefix);
      const update_log_index = await tree.storage.get(update_log_key);
      assert.equal(update_log_index, 1);
      const update_log_element_key = MerkleTree.update_log_element_to_key(prefix, update_log_index);
      const update_log_element = JSON.parse(await tree.storage.get(update_log_element_key));
      assert.equal(update_log_element.old_element, '4');
      assert.equal(update_log_element.new_element, '6');
    }

  });
});
