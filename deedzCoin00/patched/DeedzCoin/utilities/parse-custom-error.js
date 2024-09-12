function parseCustomError(contract, error) {
  if (error?.revert) {
    return error.revert;
  }
  const data = error.data;
  const tx = Object.keys(data)[0];
  if (!data[tx].return) {
    return null;
  }
  if (
    typeof data[tx].return !== "string" ||
    !data[tx].return.startsWith("0x")
  ) {
    return null;
  }
  const selector = data[tx].return.substring(0, 10);
  const fragment = contract.interface.fragments.find(
    (fragment) => fragment.selector === selector
  );
  if (!fragment) {
    return null;
  }
  return {
    name: fragment.name,
    signature: fragment.format(),
    args: contract.interface.decodeErrorResult(fragment, data[tx].return),
  };
}

module.exports = { parseCustomError };
