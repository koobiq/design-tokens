# Сравнение цветов Figma и дизайн-токенов

## Назначение

Используйте эту заметку при проверке синхронизации цветов между Figma и репозиторием токенов. Сравнивайте числовые значения переменных, а не скриншоты или цвета, отображаемые в интерфейсе Figma.

Главная особенность текущего процесса: исходные токены используют `OKLCH`, а Figma MCP возвращает цвет как `{ r, g, b, a }` в диапазоне от `0` до `1` без отдельного указания цветового пространства. Для проверенного файла числовые каналы Figma совпадают с токенами при интерпретации как Display-P3.

## Алгоритм проверки

1. Определите токен, тему и версию токенов, которые нужно сравнить.
2. Найдите исходное значение в `packages/design-tokens/web/properties/`:
    - роли — `colors.json5`;
    - примитивные цвета — `plt.json5`.
3. Получите переменные Figma через Figma MCP. Браузер, скриншот и визуальное сравнение не используйте.
4. Найдите нужную коллекцию и режим, например `Color Styles` и `Dark Mode`.
5. Пройдите цепочку `VARIABLE_ALIAS` до примитивной переменной `plt/*`.
6. Сохраните исходные значения Figma `r`, `g`, `b`, `a` без округления.
7. Интерпретируйте каналы Figma как Display-P3 и преобразуйте их в `OKLCH`.
8. Сравните `L`, `C`, `h` и альфа-канал со значением из репозитория.
9. Проверьте исходные JSON5 и результат сборки CSS.

Если проверяется состояние до изменения палитры, сравнивайте с родительским коммитом:

```bash
git show <commit>^:packages/design-tokens/web/properties/plt.json5
```

Не сравнивайте текущий токен с историческим значением и не называйте это ошибкой синхронизации.

## Получение переменных через Figma MCP

Используйте `figma_use_figma` с read-only кодом и Plugin API:

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const collection = collections.find((item) => item.name === 'Color Styles');
const mode = collection.modes.find((item) => item.name === 'Dark Mode');

const variables = await Promise.all(collection.variableIds.map((id) => figma.variables.getVariableByIdAsync(id)));

const variable = variables.find((item) => item?.name === '<variable-name>');
const value = variable.valuesByMode[mode.modeId];
```

Роль обычно содержит алиас. Разрешайте его рекурсивно:

```js
async function resolveVariable(id, modeName) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    const collection = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
    const mode = collection.modes.find((item) => item.name === modeName) ?? collection.modes[0];
    const value = variable.valuesByMode[mode.modeId];

    if (value?.type === 'VARIABLE_ALIAS') {
        return resolveVariable(value.id, modeName);
    }

    return { variable, value };
}
```

Для нескольких режимов выбирайте значение по конкретному `modeId`, а не по первому ключу. Пример цепочки:

```text
role variable → semantic variable → plt variable → { r, g, b, a }
```

## Display-P3 и sRGB

Не считайте значение sRGB только потому, что Figma показывает HEX. Запись HEX не содержит информации о цветовом пространстве.

Различайте две операции:

- **Переинтерпретация каналов** — числа Figma остаются прежними, но считаются координатами Display-P3. Именно этот вариант используется для сравнения цветов из проверенного файла.
- **Конвертация цвета** — цвет считается sRGB и переводится в Display-P3. Такая операция сохраняет внешний вид цвета и для этой палитры не даёт совпадения с исходными OKLCH-токенами.

Профиль передавайте явно:

```css
color(display-p3 0.2 0.4 0.8 / 0.75)
```

В отчёте указывайте профиль цвета, а не только HEX-значение.

Если профиль Figma для нового файла неизвестен, проверьте обе гипотезы — sRGB и Display-P3 — на нескольких известных токенах. Используйте Display-P3 только если одна интерпретация стабильно совпадает со всей проверяемой палитрой.

## Конвертация цветов

Для преобразований используйте `colorjs.io`. Каналы Figma передавайте как Display-P3:

```js
import Color from 'colorjs.io';

function figmaP3ToOklch({ r, g, b, a = 1 }) {
    const color = new Color('p3', [r, g, b]);
    color.alpha = a;

    const [lightness, chroma, hue] = color.to('oklch').coords;

    return {
        lightness: lightness * 100,
        chroma,
        hue,
        alpha: color.alpha
    };
}

function oklchToFigmaP3({ lightness, chroma, hue, alpha = 1 }) {
    const color = new Color('oklch', [lightness / 100, chroma, hue]);
    color.alpha = alpha;

    const p3 = color.to('p3');

    return {
        r: p3.coords[0],
        g: p3.coords[1],
        b: p3.coords[2],
        a: p3.alpha
    };
}
```

Не округляйте и не обрезайте каналы до преобразования. Если координата выходит за диапазон `0…1`, сначала зафиксируйте способ gamut mapping: обрезание меняет цвет.

Для оттенка используйте циклическую разницу:

```js
function hueDelta(first, second) {
    return Math.abs(((first - second + 180) % 360) - 180);
}
```

## Критерии совпадения

Для первичной проверки после преобразования можно использовать следующие пороги:

| Компонент | Допустимое расхождение                   |
| --------- | ---------------------------------------- |
| `L`       | `0.1` процентного пункта                 |
| `C`       | `0.0005`                                 |
| `h`       | `0.2°` с учётом перехода через `0°/360°` |
| `alpha`   | `1/255`                                  |

Эти пороги учитывают округление каналов Figma и округление OKLCH в токенах. Для точной синхронизации можно использовать более строгие значения, но сначала всегда проверяйте цветовое пространство.

## Контрольный список

- [ ] Указаны файл Figma, коллекция и режим.
- [ ] Использован Figma MCP, а не браузер или скриншот.
- [ ] Найдена переменная по имени и разрешена полная цепочка алиасов.
- [ ] Сохранены исходные `r`, `g`, `b`, `a`.
- [ ] Проверены интерпретации sRGB и Display-P3, если профиль неизвестен.
- [ ] Выполнено преобразование Display-P3 → OKLCH.
- [ ] Сравнены `L`, `C`, `h` и альфа-канал.
- [ ] Проверен нужный коммит репозитория.
- [ ] Сверены исходные JSON5 и сгенерированный CSS.
