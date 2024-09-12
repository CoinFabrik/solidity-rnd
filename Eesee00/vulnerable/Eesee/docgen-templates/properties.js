const { isNodeType } = require('solidity-ast/utils');


module.exports.inheritance = function ({ item, build }) {
    if (isNodeType('ContractDefinition', item)) {
        return item.linearizedBaseContracts
          .map(id => build.deref('ContractDefinition', id))
          .filter((c, i) => c.name !== 'Context' || i === 0);
    }
    return []
};

module.exports['is-modifier'] = function({item}) {
    return item.type == 'Modifier'
}

module.exports['inherited-functions'] = function ({ item }) {
  const { inheritance } = item;
  const baseFunctions = new Set(inheritance.flatMap(c => c.functions.flatMap(f => f.baseFunctions ?? [])));
  return inheritance.map((contract, i) => {
        const functions = contract.functions.filter(f => !baseFunctions.has(f.id) && (f.name !== 'constructor' || i === 0))
        const events = contract.events
        return {
          contract,
          functions,
          events,
          'has-functions': functions.length > 0,
          'has-events': events.length > 0,
          'has-either': functions.length > 0 || events.length > 0
        }
    });
};