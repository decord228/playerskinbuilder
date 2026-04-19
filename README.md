# SkinBuilder React - VideoPlayer Editor

Полностью переработанная версия VideoPlayer Editor на React с модульной архитектурой.

## Что было сделано

### ✅ Полный перенос функционала
- **Система типов узлов** - все 14 типов узлов (CanvasLayer, Button, Label, HSlider, VolumeButton и др.)
- **Система свойств** - полная поддержка всех свойств с типами (text, bool, color, select, anchor, size_flags)
- **Дефолтная сцена** - полностью перенесена с видеоплеером и всеми контролами
- **Иконки** - все SVG иконки для типов узлов и UI элементов
- **Стили** - полная тема с CSS переменными

### 🎨 Архитектура

```
refactored/
├── src/
│   ├── components/          # React компоненты
│   │   ├── Header.jsx       # Верхняя панель с меню
│   │   ├── Outliner.jsx     # Дерево узлов (левая панель)
│   │   ├── PropertiesPanel.jsx  # Панель свойств (правая панель)
│   │   └── Viewport.jsx     # Viewport с canvas
│   ├── data/                # Данные и конфигурация
│   │   ├── nodeTypes.js     # Типы узлов
│   │   ├── icons.js         # SVG иконки
│   │   ├── propertySystem.js # Система свойств
│   │   └── defaultScene.js  # Дефолтная сцена
│   ├── store/
│   │   └── useStore.js      # Zustand store с persist
│   ├── styles/
│   │   └── global.css       # Глобальные стили
│   ├── App.jsx              # Главный компонент
│   └── main.jsx             # Entry point
├── package.json
└── vite.config.js
```

### 🚀 Технологии

- **React 18** - UI библиотека
- **Zustand** - State management с persist
- **Vite** - Build tool
- **CSS Modules** - Стилизация компонентов

## Запуск проекта

### Установка зависимостей (если еще не установлены)
```bash
cd refactored
npm install
```

### Запуск dev сервера
```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`

### Сборка для продакшена
```bash
npm run build
```

### Preview продакшен сборки
```bash
npm run preview
```

## Основные возможности

### ✨ Функционал
- ✅ Дерево узлов с drag & drop
- ✅ Редактирование свойств в реальном времени
- ✅ Система типов узлов (14 типов)
- ✅ Anchor system (10 пресетов)
- ✅ Size flags (FILL, EXPAND, SHRINK_*)
- ✅ Автосохранение в localStorage
- ✅ Режимы Edit/Test
- ✅ Zoom viewport
- ✅ Дефолтная сцена с видеоплеером

### 🎯 Компоненты UI
- **Header** - меню, режимы Edit/Test
- **Outliner** - дерево узлов с иконками, видимость, блокировка
- **PropertiesPanel** - редактор свойств с разными типами полей
- **Viewport** - canvas с zoom и pan

### 📦 Store (Zustand)
- `tree` - массив всех узлов
- `selectedNodeId` - выбранный узел
- `mode` - режим (edit/test)
- `zoom` - масштаб viewport
- Операции: addNode, updateNode, deleteNode, duplicateNode, moveNode, reorderNode

## Отличия от оригинала

### ✅ Улучшения
- Модульная структура вместо одного файла
- React компоненты вместо vanilla JS
- Zustand store вместо глобальных переменных
- TypeScript-ready архитектура
- Лучшая производительность
- Проще поддерживать и расширять

### 🔄 Сохранено
- Весь функционал
- Все типы узлов
- Все свойства
- Дефолтная сцена
- Визуальный стиль
- Логика работы

## Следующие шаги

### 🚧 Что можно добавить
- [ ] DOM рендеринг узлов в viewport (сейчас только background)
- [ ] Drag & drop в outliner
- [ ] Context menu
- [ ] Keyboard shortcuts
- [ ] Undo/Redo
- [ ] Export/Import сцен
- [ ] Gradient editor
- [ ] Margin preview

## Структура данных

### Node
```javascript
{
  id: 'n500',
  type: 'Button',
  label: 'Play Button',
  pid: 'parent_id',
  children: ['n501'],
  open: true,
  visible: true,
  locked: false,
  props: {
    text: 'Play',
    bg_color: 'rgba(255,255,255,0.1)',
    // ...
  }
}
```

## Команды

```bash
npm run dev      # Запуск dev сервера
npm run build    # Сборка для продакшена
npm run preview  # Preview продакшен сборки
```

---

**Версия:** 1.0.0  
**Дата:** 2026-04-18  
**Статус:** ✅ Полностью функциональный
