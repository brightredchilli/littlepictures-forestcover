export const download = (s: string, fn: string) => {
  var bb = new Blob([s], { type: 'text/json' });
  var a = document.createElement('a');
  a.download = fn;
  a.href = window.URL.createObjectURL(bb);
  a.click();
}
