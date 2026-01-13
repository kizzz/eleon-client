import('./bootstrap').catch((err) => {
  console.error(err);
  window['addEleoncoreError'](err);
});

