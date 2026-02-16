export default new Proxy(
  {},
  {
    get(_target, prop) {
      return prop;
    },
  },
);
