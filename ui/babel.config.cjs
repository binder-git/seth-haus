module.exports = function (api) {
  const isTest = api.env('test');
  
  const presets = [
    ['@babel/preset-env', {
      targets: isTest ? { node: 'current' } : 'defaults',
      modules: isTest ? 'commonjs' : false,
      useBuiltIns: 'usage',
      corejs: 3,
    }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ];

  const plugins = [
    isTest && 'babel-plugin-transform-import-meta',
  ].filter(Boolean);

  return {
    presets,
    plugins,
  };
};