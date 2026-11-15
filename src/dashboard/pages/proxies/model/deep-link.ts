// Deep links (?add=1, ?import=1) open once; drop them so a reload doesn't reopen.
export function clearDeepLink() {
  const params = new URLSearchParams(location.search);
  params.delete('add');
  params.delete('import');
  history.replaceState(null, '', '?' + params.toString());
}
