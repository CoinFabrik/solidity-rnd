async function promiseHandler(promise) {
  return promise
    .then((result) => [result, null])
    .catch((error) => [null, error]);
}

module.exports = { promiseHandler };
