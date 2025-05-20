// Custom transformer to handle import.meta in Jest tests
module.exports = {
  process() {
    return {
      code: 'module.exports = { env: {} };',
    };
  },
};
