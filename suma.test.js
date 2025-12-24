
const suma = (a, b) => a + b; // Tu función real estaría en otro archivo

test('suma 1 + 2 es igual a 3', () => {
  expect(suma(1, 2)).toBe(3);
});
